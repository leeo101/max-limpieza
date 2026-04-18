'use client';

import { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Breadcrumbs from '@/components/Breadcrumbs';
import ProductCard from '@/components/ProductCard';
import { ProductSkeleton } from '@/components/Skeleton';
import { 
  Filter, 
  ChevronDown, 
  X, 
  SlidersHorizontal, 
  ShoppingBag,
  ArrowRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string | null;
  category_name?: string;
  category_id: string | null;
  bestseller: number;
  featured: number;
}

interface Category {
  id: string;
  name: string;
  slug: string;
}

export default function ShopContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState('newest');
  const [maxPrice, setMaxPrice] = useState(100000);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState(false);
  
  const searchQuery = searchParams.get('search') || '';

  useEffect(() => {
    const category = searchParams.get('category') || '';
    setSelectedCategory(category);
  }, [searchParams]);

  useEffect(() => {
    async function fetchData() {
      try {
        const [productsRes, categoriesRes] = await Promise.all([
          fetch('/api/products'),
          fetch('/api/categories')
        ]);

        const productsData = await productsRes.json();
        const categoriesData = await categoriesRes.json();

        if (productsData.success) {
          setProducts(productsData.data);
          const highestPrice = Math.max(...productsData.data.map((p: Product) => p.price), 0);
          setMaxPrice(highestPrice > 0 ? highestPrice : 100000);
        }

        if (categoriesData.success) {
          setCategories(categoriesData.data);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  const filteredProducts = products
    .filter(product => {
      if (searchQuery && !product.name.toLowerCase().includes(searchQuery.toLowerCase()) &&
        !product.description?.toLowerCase().includes(searchQuery.toLowerCase())) {
        return false;
      }
      if (selectedCategory) {
        // Slug comparison
        const cat = categories.find(c => c.slug === selectedCategory);
        if (cat && product.category_name !== cat.name) return false;
        if (!cat && product.category_name?.toLowerCase() !== selectedCategory.toLowerCase()) return false;
      }
      return true;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'price-asc': return a.price - b.price;
        case 'price-desc': return b.price - a.price;
        case 'name': return a.name.localeCompare(b.name);
        default: return 0;
      }
    });

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Header />

      <main className="flex-1">
        {/* Hero Shop Section */}
        <section className="bg-gray-900 overflow-hidden relative pt-12 pb-24 md:pt-16 md:pb-32 px-4">
          <div className="absolute inset-0 bg-sky-500/10 mix-blend-overlay" />
          <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_0%,rgba(2,132,199,0.3),transparent_70%)]" />
          
          <div className="max-w-7xl mx-auto relative z-10 text-center">
            <Breadcrumbs 
              items={selectedCategory ? [{ label: selectedCategory, href: '#' }] : []} 
              className="mb-8 justify-center opacity-60 text-white" 
            />
            <h1 className="text-4xl md:text-6xl font-black text-white uppercase tracking-tighter leading-tight mb-6">
              {searchQuery ? `"${searchQuery}"` : selectedCategory ? selectedCategory : 'Nuestra Tienda'}
            </h1>
            <p className="text-sky-200/60 font-medium max-w-xl mx-auto uppercase tracking-widest text-[10px] md:text-xs">
              Calidad premium para el cuidado de tu hogar e industria
            </p>
          </div>
        </section>

        {/* Toolbar */}
        <div className="sticky top-20 z-40 bg-white/80 backdrop-blur-md border-b border-gray-100 shadow-sm">
          <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
            <div className="flex items-center gap-4 overflow-x-auto scrollbar-hide pb-1 pr-4">
              <button
                onClick={() => setSelectedCategory('')}
                className={`px-5 py-2 rounded-full text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap 
                  ${selectedCategory === '' ? 'bg-sky-500 text-white shadow-lg shadow-sky-500/20' : 'bg-gray-50 text-gray-400 hover:bg-gray-100'}`}
              >
                Todos
              </button>
              {categories.map(cat => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.slug)}
                  className={`px-5 py-2 rounded-full text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap
                    ${selectedCategory === cat.slug ? 'bg-sky-500 text-white shadow-lg shadow-sky-500/20' : 'bg-gray-50 text-gray-400 hover:bg-gray-100'}`}
                >
                  {cat.name}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-4 ml-4">
              <div className="hidden md:flex items-center gap-2">
                <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">Ordenar:</span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="bg-transparent border-none text-[10px] font-black uppercase tracking-widest text-sky-600 focus:ring-0 cursor-pointer"
                >
                  <option value="newest">Nuevos</option>
                  <option value="price-asc">Precio Min</option>
                  <option value="price-desc">Precio Max</option>
                  <option value="name">A-Z</option>
                </select>
              </div>
              <button 
                onClick={() => setIsMobileFiltersOpen(true)}
                className="md:hidden p-2 bg-gray-50 text-gray-900 rounded-lg"
              >
                <SlidersHorizontal size={18} />
              </button>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 py-12">
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Sidebar Filters Desktop */}
            <aside className="hidden lg:block w-64 space-y-8 flex-shrink-0">
              <div>
                <h3 className="text-xs font-black uppercase tracking-[0.2em] text-gray-900 mb-6 flex items-center gap-2">
                  <Filter size={14} /> Filtros Rápidos
                </h3>
                <div className="space-y-2">
                  <label className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl cursor-pointer group hover:bg-sky-50 transition-colors">
                    <input type="checkbox" className="w-4 h-4 rounded border-gray-300 text-sky-500 focus:ring-sky-500" />
                    <span className="text-[10px] font-black uppercase tracking-widest text-gray-500 group-hover:text-sky-600">En Oferta</span>
                  </label>
                  <label className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl cursor-pointer group hover:bg-sky-50 transition-colors">
                    <input type="checkbox" className="w-4 h-4 rounded border-gray-300 text-sky-500 focus:ring-sky-500" />
                    <span className="text-[10px] font-black uppercase tracking-widest text-gray-500 group-hover:text-sky-600">Destacados</span>
                  </label>
                </div>
              </div>

              <div>
                <h3 className="text-xs font-black uppercase tracking-[0.2em] text-gray-900 mb-6">Info Envíos</h3>
                <div className="bg-sky-500 text-white p-6 rounded-[32px] shadow-xl shadow-sky-500/20 relative overflow-hidden group">
                  <div className="relative z-10">
                    <p className="text-[10px] font-black uppercase tracking-widest mb-1 opacity-80">Promoción</p>
                    <p className="text-xl font-black uppercase tracking-tighter leading-none mb-4">Envío Gratis</p>
                    <p className="text-[10px] font-medium opacity-80 mb-6">En compras superando los $50.000 a todo el país.</p>
                    <button className="w-full py-3 bg-white text-sky-600 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2">
                      Saber más <ArrowRight size={12} />
                    </button>
                  </div>
                  <Truck className="absolute -bottom-4 -right-4 w-24 h-24 opacity-10 group-hover:rotate-12 transition-transform duration-700" />
                </div>
              </div>
            </aside>

            {/* Content Area */}
            <div className="flex-1">
              <div className="flex items-center justify-between mb-8">
                <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">
                  {filteredProducts.length} Resultado{filteredProducts.length !== 1 ? 's' : ''}
                </p>
              </div>

              {loading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {[...Array(6)].map((_, i) => <ProductSkeleton key={i} />)}
                </div>
              ) : filteredProducts.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
                  {filteredProducts.map((p) => <ProductCard key={p.id} {...p} />)}
                </div>
              ) : (
                <div className="text-center py-24 bg-gray-50 rounded-[40px] border-2 border-dashed border-gray-100">
                  <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mx-auto mb-6 shadow-xl">
                    <ShoppingBag size={32} className="text-gray-200" />
                  </div>
                  <h3 className="text-2xl font-black text-gray-900 uppercase tracking-tighter mb-2">No encontramos nada</h3>
                  <p className="text-gray-400 font-medium max-w-xs mx-auto text-sm mb-8">
                    Probablemente no tengamos stock por el momento o los filtros sean muy específicos.
                  </p>
                  <button 
                    onClick={() => { setSelectedCategory(''); router.push('/tienda'); }}
                    className="px-8 py-3 bg-gray-900 text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-xl"
                  >
                    Ver todos los productos
                  </button>
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
