'use client';

import { useState, useEffect } from 'react';
import { 
  Plus, 
  Search, 
  MoreVertical, 
  Edit2, 
  Trash2, 
  LayoutGrid as CategoryIcon,
  Tag,
  CheckCircle,
  XCircle,
  ChevronRight
} from 'lucide-react';
import Modal from '@/components/ui/Modal';
import { toast } from 'react-hot-toast';

interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  active: number;
}

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    description: '',
    active: 1,
  });

  useEffect(() => {
    fetchCategories();
  }, []);

  async function fetchCategories() {
    const token = localStorage.getItem('adminToken');
    try {
      const response = await fetch('/api/categories?activeOnly=false', {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      const result = await response.json();
      if (result.success) {
        setCategories(result.data);
      }
    } catch {
      toast.error('Error al cargar categorías');
    } finally {
      setLoading(false);
    }
  }

  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  };

  const openModal = (category?: Category) => {
    if (category) {
      setEditingCategory(category);
      setFormData({
        name: category.name,
        slug: category.slug,
        description: category.description || '',
        active: category.active,
      });
    } else {
      setEditingCategory(null);
      setFormData({
        name: '',
        slug: '',
        description: '',
        active: 1,
      });
    }
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = localStorage.getItem('adminToken');
    try {
      const url = editingCategory ? `/api/categories?id=${editingCategory.id}` : '/api/categories';
      const method = editingCategory ? 'PUT' : 'POST';

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
        toast.success(editingCategory ? 'Categoría actualizada' : 'Categoría creada');
        setShowModal(false);
        fetchCategories();
      } else {
        toast.error('Error al guardar');
      }
    } catch {
      toast.error('Error de conexión');
    }
  };

  const deleteCategory = async (id: string) => {
    if (!confirm('¿Estás seguro de eliminar esta categoría?')) return;
    const token = localStorage.getItem('adminToken');
    try {
      const response = await fetch(`/api/categories?id=${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` },
      });
      const result = await response.json();
      if (result.success) {
        toast.success('Categoría eliminada');
        fetchCategories();
      } else {
        toast.error('Error al eliminar');
      }
    } catch {
      toast.error('Error de conexión');
    }
  };

  const filteredCategories = categories.filter(c => 
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.slug.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      {/* Header section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black text-gray-900 tracking-tight uppercase">Categorías</h1>
          <p className="text-gray-500 font-medium text-sm mt-1">Organiza tu catálogo de productos</p>
        </div>
        <button
          onClick={() => openModal()}
          className="flex items-center justify-center gap-2 px-6 py-4 bg-sky-600 text-white rounded-2xl font-black uppercase tracking-widest hover:bg-sky-700 transition-all shadow-xl shadow-sky-600/20 active:scale-95"
        >
          <Plus size={20} strokeWidth={3} />
          <span>Nueva Categoría</span>
        </button>
      </div>

      {/* Tool bar */}
      <div className="relative group">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-sky-500 transition-colors" />
        <input
          type="text"
          placeholder="Buscar categorías..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-12 pr-4 py-4 rounded-2xl border-none focus:ring-2 focus:ring-sky-500/20 shadow-sm bg-white text-sm font-bold text-gray-700 placeholder:text-gray-300 transition-all"
        />
      </div>

      {/* Grid for categories (Responsive) */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-40 bg-white rounded-3xl animate-pulse border border-gray-100" />
          ))}
        </div>
      ) : filteredCategories.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCategories.map((category) => (
            <div 
              key={category.id} 
              className="group bg-white rounded-[32px] p-6 shadow-sm border border-gray-100 hover:shadow-2xl hover:shadow-gray-200 transition-all duration-300 relative overflow-hidden"
            >
              <div className="flex justify-between items-start mb-4">
                <div className={`p-3 rounded-2xl ${category.active === 1 ? 'bg-sky-50 text-sky-600' : 'bg-gray-50 text-gray-400'}`}>
                  <Tag size={20} />
                </div>
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={() => openModal(category)} className="p-2 text-gray-400 hover:text-sky-600 hover:bg-sky-50 rounded-xl transition-all">
                    <Edit2 size={16} />
                  </button>
                  <button onClick={() => deleteCategory(category.id)} className="p-2 text-gray-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all">
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>

              <div>
                <h3 className="text-xl font-black text-gray-900 uppercase tracking-tight mb-1">{category.name}</h3>
                <p className="text-[10px] font-mono text-gray-400 italic mb-3">/{category.slug}</p>
                <p className="text-xs text-gray-500 font-medium line-clamp-2 min-h-[32px]">
                  {category.description || 'Sin descripción disponible para esta categoría.'}
                </p>
              </div>

              <div className="mt-6 pt-6 border-t border-gray-50 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {category.active === 1 ? (
                    <span className="flex items-center gap-1.5 px-2.5 py-1 bg-emerald-50 text-emerald-600 text-[10px] font-black uppercase rounded-lg border border-emerald-100">
                      <CheckCircle size={10} /> Activa
                    </span>
                  ) : (
                    <span className="flex items-center gap-1.5 px-2.5 py-1 bg-gray-50 text-gray-400 text-[10px] font-black uppercase rounded-lg border border-gray-100">
                      <XCircle size={10} /> Inactiva
                    </span>
                  )}
                </div>
                <button 
                  onClick={() => openModal(category)}
                  className="p-2 bg-gray-50 text-gray-400 rounded-xl hover:bg-sky-500 hover:text-white transition-all transform group-hover:translate-x-1"
                >
                  <ChevronRight size={18} />
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-20 bg-white rounded-[40px] border-2 border-dashed border-gray-100">
          <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6">
            <Tag size={32} className="text-gray-200" />
          </div>
          <h3 className="text-2xl font-black text-gray-900 uppercase tracking-tight mb-2">No hay categorías</h3>
          <p className="text-gray-400 font-medium max-w-xs mx-auto text-sm">Empieza creando una nueva categoría para organizar tus productos.</p>
        </div>
      )}

      {/* Modal for Create/Edit */}
      <Modal 
        isOpen={showModal} 
        onClose={() => setShowModal(false)} 
        title={editingCategory ? 'Editar Categoría' : 'Nueva Categoría'}
      >
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <div>
              <label className="block text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-2 px-1">Nombre de categoría</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => {
                  const name = e.target.value;
                  setFormData({ 
                    ...formData, 
                    name,
                    slug: generateSlug(name)
                  });
                }}
                required
                className="w-full px-5 py-4 bg-gray-50 border-none rounded-2xl text-sm font-bold text-gray-800 placeholder:text-gray-300 focus:ring-2 focus:ring-sky-500/20 transition-all"
                placeholder="Ej. Artículos de Cocina"
              />
            </div>

            <div>
              <label className="block text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-2 px-1">Slug (Automático)</label>
              <input
                type="text"
                value={formData.slug}
                readOnly
                className="w-full px-5 py-4 bg-gray-100 border-none rounded-2xl text-sm font-mono text-gray-400 cursor-not-allowed"
                placeholder="ej-articulos-de-cocina"
              />
            </div>

            <div>
              <label className="block text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-2 px-1">Descripción</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={3}
                className="w-full px-5 py-4 bg-gray-50 border-none rounded-2xl text-sm font-bold text-gray-800 placeholder:text-gray-300 focus:ring-2 focus:ring-sky-500/20 transition-all resize-none"
                placeholder="Breve descripción para uso interno..."
              />
            </div>

            <label className="flex items-center gap-3 p-4 bg-gray-50 rounded-2xl cursor-pointer hover:bg-gray-100 transition-colors group">
              <div className="relative flex items-center">
                <input
                  type="checkbox"
                  checked={formData.active === 1}
                  onChange={(e) => setFormData({ ...formData, active: e.target.checked ? 1 : 0 })}
                  className="peer h-6 w-6 cursor-pointer appearance-none rounded-lg border-2 border-gray-300 transition-all checked:border-sky-500 checked:bg-sky-500"
                />
                <CheckCircle className="pointer-events-none absolute left-0.5 top-0.5 h-5 w-5 scale-0 text-white transition-transform peer-checked:scale-100" />
              </div>
              <div>
                <span className="block text-sm font-black text-gray-700 uppercase tracking-tight">Categoría Activa</span>
                <span className="block text-[10px] text-gray-400 font-bold uppercase tracking-widest">Visible en la tienda</span>
              </div>
            </label>
          </div>

          <div className="flex gap-4">
            <button
              type="submit"
              className="flex-1 py-4 bg-sky-600 text-white rounded-2xl font-black uppercase tracking-widest text-sm shadow-xl shadow-sky-600/20 hover:bg-sky-700 active:scale-95 transition-all"
            >
              {editingCategory ? 'Guardar Cambios' : 'Crear Categoría'}
            </button>
            <button
              type="button"
              onClick={() => setShowModal(false)}
              className="px-6 py-4 bg-gray-100 text-gray-500 rounded-2xl font-black uppercase tracking-widest text-sm hover:bg-gray-200 transition-all"
            >
              Cerrar
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
