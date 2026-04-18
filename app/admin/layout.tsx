import { Search, LayoutDashboard, Package, Tags, ShoppingCart, LogOut, Globe, Bell } from 'lucide-react';
import { useStore } from '@/store/useStore';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [loading, setLoading] = useState(true);
  const { pendingOrdersCount, setPendingOrdersCount } = useStore();
  const [globalSearch, setGlobalSearch] = useState('');

  useEffect(() => {
    // Skip token check on login page
    if (pathname === '/admin/login') {
      setLoading(false);
      return;
    }

    const token = localStorage.getItem('adminToken');
    if (!token) {
      router.push('/admin/login');
      return;
    }

    // Verify token and fetch initial stats
    const fetchStats = async () => {
      try {
        const res = await fetch('/api/orders?action=stats', {
          headers: { 'Authorization': `Bearer ${token}` },
        });
        if (res.status === 401) {
          localStorage.removeItem('adminToken');
          router.push('/admin/login');
        } else {
          const data = await res.json();
          if (data.success) {
            setPendingOrdersCount(data.data.pendingOrders);
          }
          setLoading(false);
        }
      } catch (e) {
        setLoading(false);
      }
    };

    fetchStats();

    // Polling every 10 minutes as requested
    const pollInterval = setInterval(fetchStats, 10 * 60 * 1000);

    // Keyboard Shortcuts for Admin
    const handleKeyDown = (e: KeyboardEvent) => {
      // Only trigger if Shift is pressed and not in an input
      if (e.shiftKey && document.activeElement?.tagName !== 'INPUT' && document.activeElement?.tagName !== 'TEXTAREA') {
        switch (e.key.toUpperCase()) {
          case 'D': router.push('/admin/dashboard'); break;
          case 'P': router.push('/admin/productos'); break;
          case 'C': router.push('/admin/categorias'); break;
          case 'O': router.push('/admin/pedidos'); break;
          case 'S': 
            const searchInput = document.querySelector('header input') as HTMLInputElement;
            searchInput?.focus();
            break;
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      clearInterval(pollInterval);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [router, pathname, setPendingOrdersCount]);

  const logout = () => {
    localStorage.removeItem('adminToken');
    document.cookie = 'adminToken=; path=/; max-age=0';
    router.push('/admin/login');
  };

  const navItems = [
    { name: 'Dashboard', path: '/admin/dashboard', icon: LayoutDashboard },
    { name: 'Productos', path: '/admin/productos', icon: Package },
    { name: 'Categorías', path: '/admin/categorias', icon: Tags },
    { name: 'Pedidos', path: '/admin/pedidos', icon: ShoppingCart },
  ];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-sky-500"></div>
          <p className="text-gray-400 text-sm font-medium">Verificando acceso...</p>
        </div>
      </div>
    );
  }

  // Don't show admin chrome on login page
  if (pathname === '/admin/login') {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ── Desktop Sidebar ── */}
      <aside className="hidden lg:flex fixed top-0 left-0 z-50 h-full w-64 bg-white shadow-lg flex-col">
        <div className="p-6 flex-1 overflow-y-auto">
          <div className="flex items-center gap-3 mb-8">
            <div className="relative w-12 h-12 flex-shrink-0">
              <Image
                src="/logo.png"
                alt="MAX Admin Logo"
                fill
                className="object-contain"
              />
            </div>
            <div>
              <h1 className="font-bold text-gray-900">MAX Admin</h1>
              <p className="text-xs text-gray-500">Panel de Gestión</p>
            </div>
          </div>

          <nav className="space-y-1">
            {navItems.map((item) => (
              <Link
                key={item.path}
                href={item.path}
                className={`flex items-center justify-between px-4 py-3 rounded-xl transition-all duration-200 ${
                  pathname === item.path
                    ? 'bg-sky-500 text-white shadow-lg shadow-sky-500/20'
                    : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                }`}
              >
                <div className="flex items-center gap-3">
                  <item.icon className="w-5 h-5 flex-shrink-0" />
                  <span className="font-semibold">{item.name}</span>
                </div>
                {item.name === 'Pedidos' && pendingOrdersCount > 0 && (
                  <span className={`flex items-center justify-center min-w-[20px] h-5 px-1.5 rounded-full text-[10px] font-black ${
                    pathname === item.path ? 'bg-white text-sky-600' : 'bg-rose-500 text-white'
                  }`}>
                    {pendingOrdersCount}
                  </span>
                )}
              </Link>
            ))}
          </nav>
        </div>

        <div className="p-6 border-t border-gray-100">
          <Link
            href="/"
            className="flex items-center gap-2 px-4 py-2.5 text-gray-500 hover:text-sky-600 hover:bg-sky-50 rounded-xl transition-colors text-sm font-medium mb-2"
          >
            <Globe className="w-4 h-4" />
            Ver Tienda
          </Link>
          <button
            onClick={logout}
            className="w-full px-4 py-2.5 text-red-500 hover:bg-red-50 rounded-xl transition-colors text-left flex items-center gap-2 font-medium text-sm"
          >
            <LogOut className="w-4 h-4" />
            Cerrar Sesión
          </button>
        </div>
      </aside>

      {/* ── Main Content Area ── */}
      <div className="lg:ml-64">
        {/* Top bar */}
        <header className="bg-white shadow-sm sticky top-0 z-30 border-b border-gray-100">
          <div className="flex items-center justify-between px-4 sm:px-6 py-3">
            {/* Mobile: Logo + Title */}
            <div className="flex items-center gap-2.5 lg:hidden">
              <div className="relative w-8 h-8 flex-shrink-0">
                <Image src="/logo.png" alt="MAX" fill className="object-contain" />
              </div>
              <div>
                <span className="font-black text-gray-900 text-sm">MAX Admin</span>
                <span className="block text-[10px] text-gray-400">Panel de Gestión</span>
              </div>
            </div>

            {/* Desktop: Global Search */}
            <div className="hidden lg:flex flex-1 max-w-md mx-8 relative group">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-sky-500 transition-colors" />
              <input 
                type="text"
                placeholder="Búsqueda global..."
                className="w-full pl-10 pr-4 py-2 bg-gray-50 border-none rounded-xl text-xs font-bold text-gray-700 focus:ring-2 focus:ring-sky-500/20 transition-all"
                value={globalSearch}
                onChange={(e) => setGlobalSearch(e.target.value)}
              />
            </div>

            {/* Right actions */}
            <div className="flex items-center gap-3">
              <button className="relative p-2 text-gray-400 hover:text-sky-600 transition-colors">
                <Bell size={20} />
                {pendingOrdersCount > 0 && (
                  <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-rose-500 border-2 border-white rounded-full animate-ping" />
                )}
              </button>
              <Link
                href="/"
                className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-sky-600 transition-colors px-3 py-1.5 rounded-lg hover:bg-sky-50"
              >
                <Globe className="w-4 h-4" />
                <span className="hidden sm:inline font-medium text-xs font-black uppercase tracking-widest">Tienda</span>
              </Link>
            </div>
          </div>
        </header>

        {/* Page content — pb-24 on mobile so content isn't hidden behind bottom nav */}
        <main className="p-4 sm:p-6 pb-28 lg:pb-8">
          {children}
        </main>
      </div>

      {/* ── Mobile Bottom Navigation Bar ── */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 lg:hidden bg-white border-t border-gray-100 shadow-[0_-2px_20px_rgba(0,0,0,0.06)]">
        <div className="flex items-stretch justify-around px-1 pt-1 pb-2">
          {navItems.map((item) => {
            const isActive = pathname === item.path;
            return (
              <Link
                key={item.path}
                href={item.path}
                className={`flex flex-col items-center justify-center gap-0.5 flex-1 py-2 rounded-xl transition-all duration-200 ${
                  isActive
                    ? 'text-sky-600'
                    : 'text-gray-400 active:bg-gray-50'
                }`}
              >
                <div className={`p-1.5 rounded-xl transition-colors relative ${isActive ? 'bg-sky-50' : ''}`}>
                  <item.icon className={`w-5 h-5 transition-transform duration-200 ${isActive ? 'scale-110' : ''}`} />
                  {item.name === 'Pedidos' && pendingOrdersCount > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-rose-500 text-white text-[8px] font-black flex items-center justify-center rounded-full border border-white">
                      {pendingOrdersCount}
                    </span>
                  )}
                </div>
                <span className={`text-[9px] font-bold tracking-tight ${isActive ? 'text-sky-600' : 'text-gray-400'}`}>
                  {item.name}
                </span>
              </Link>
            );
          })}

          {/* Logout button */}
          <button
            onClick={logout}
            className="flex flex-col items-center justify-center gap-0.5 flex-1 py-2 text-red-400 active:bg-red-50 rounded-xl transition-colors"
          >
            <div className="p-1.5 rounded-xl">
              <LogOut className="w-5 h-5" />
            </div>
            <span className="text-[9px] font-bold tracking-tight">Salir</span>
          </button>
        </div>
      </nav>
    </div>
  );
}
