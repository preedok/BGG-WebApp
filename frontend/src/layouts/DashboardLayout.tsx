import React, { useState, useRef, useEffect } from 'react';
import { Outlet, useNavigate, useLocation, Navigate } from 'react-router-dom';
import {
  Menu,
  X,
  Globe,
  LayoutDashboard,
  Hotel,
  FileText,
  Plane,
  Bus,
  Package,
  Receipt,
  Users,
  Building2,
  BarChart3,
  Settings,
  Bell,
  User,
  LogOut,
  Search,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Rocket,
  UserPlus
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { MenuItem, UserRole, ROLE_NAMES } from '../types';
import Dropdown from '../components/common/Dropdown';
import Badge from '../components/common/Badge';
import MaintenanceBanner from '../components/MaintenanceBanner';
import logo from '../assets/logo.png';
import { publicApi } from '../services/api';

const menuItems: MenuItem[] = [
  {
    title: 'Dashboard',
    icon: <LayoutDashboard className="w-5 h-5" />,
    path: '/dashboard',
    roles: ['super_admin', 'admin_pusat', 'admin_cabang', 'role_invoice', 'role_hotel', 'role_visa', 'role_bus', 'role_ticket', 'role_accounting', 'owner']
  },
  {
    title: 'Products',
    icon: <Package className="w-5 h-5" />,
    path: '/dashboard/products',
    roles: ['super_admin', 'admin_pusat', 'admin_cabang', 'role_hotel', 'role_visa', 'role_bus', 'role_ticket', 'owner']
  },
  {
    title: 'Order & Invoice',
    icon: <Receipt className="w-5 h-5" />,
    path: '/dashboard/orders-invoices',
    roles: ['admin_pusat', 'admin_cabang']
  },
  {
    title: 'Orders',
    icon: <Receipt className="w-5 h-5" />,
    path: '/dashboard/orders',
    roles: ['super_admin', 'role_invoice', 'owner']
  },
  {
    title: 'Invoices',
    icon: <Receipt className="w-5 h-5" />,
    path: '/dashboard/invoices',
    roles: ['super_admin', 'role_invoice', 'role_accounting', 'owner']
  },
  {
    title: 'Users',
    icon: <Users className="w-5 h-5" />,
    path: '/dashboard/users',
    roles: ['super_admin', 'admin_pusat', 'admin_cabang']
  },
  {
    title: 'Owner Cabang',
    icon: <Users className="w-5 h-5" />,
    path: '/dashboard/admin-cabang/owners',
    roles: ['admin_cabang']
  },
  {
    title: 'Personil Cabang',
    icon: <UserPlus className="w-5 h-5" />,
    path: '/dashboard/admin-cabang/personil',
    roles: ['admin_cabang']
  },
  {
    title: 'Branches',
    icon: <Building2 className="w-5 h-5" />,
    path: '/dashboard/branches',
    roles: ['super_admin', 'admin_pusat']
  },
  {
    title: 'Buat Akun (Bus/Hotel/Admin Cabang)',
    icon: <UserPlus className="w-5 h-5" />,
    path: '/dashboard/admin-pusat/users',
    roles: ['admin_pusat']
  },
  {
    title: 'Flyer & Template',
    icon: <Package className="w-5 h-5" />,
    path: '/dashboard/flyers',
    roles: ['admin_pusat']
  },
  {
    title: 'Reports',
    icon: <BarChart3 className="w-5 h-5" />,
    path: '/dashboard/reports',
    roles: ['super_admin', 'admin_pusat', 'role_accounting']
  },
  {
    title: 'Laporan Keuangan',
    icon: <FileText className="w-5 h-5" />,
    path: '/dashboard/accounting/financial-report',
    roles: ['role_accounting']
  },
  {
    title: 'Rekonsiliasi Bank',
    icon: <Receipt className="w-5 h-5" />,
    path: '/dashboard/accounting/reconciliation',
    roles: ['role_accounting']
  },
  {
    title: 'Piutang (AR)',
    icon: <BarChart3 className="w-5 h-5" />,
    path: '/dashboard/accounting/aging',
    roles: ['role_accounting']
  },
  {
    title: 'Daftar Order',
    icon: <Receipt className="w-5 h-5" />,
    path: '/dashboard/accounting/orders',
    roles: ['role_accounting']
  },
  {
    title: 'Settings',
    icon: <Settings className="w-5 h-5" />,
    path: '/dashboard/settings',
    roles: ['super_admin', 'admin_pusat', 'admin_cabang', 'owner']
  },
  {
    title: 'System Logs',
    icon: <FileText className="w-5 h-5" />,
    path: '/dashboard/super-admin/logs',
    roles: ['super_admin']
  },
  {
    title: 'Maintenance',
    icon: <Bell className="w-5 h-5" />,
    path: '/dashboard/super-admin/maintenance',
    roles: ['super_admin']
  }
];

const DashboardLayout: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [notificationOpen, setNotificationOpen] = useState(false);
  const [notifications, setNotifications] = useState<Array<{ id: string; title: string; message: string; type: string }>>([]);
  const notificationRef = useRef<HTMLDivElement>(null);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const searchRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    publicApi.getActiveMaintenance()
      .then((res) => { if (res.data.success && Array.isArray(res.data.data)) setNotifications(res.data.data); })
      .catch(() => {});
  }, []);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (notificationRef.current && !notificationRef.current.contains(e.target as Node)) setNotificationOpen(false);
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) setSearchOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (searchOpen) searchInputRef.current?.focus();
  }, [searchOpen]);

  const handleSearchKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      setSearchOpen(false);
      setSearchQuery('');
    }
    if (e.key === 'Enter' && searchQuery.trim()) {
      setSearchOpen(false);
      if (user?.role === 'super_admin') {
        navigate('/dashboard');
      } else {
        navigate(`/dashboard/orders?q=${encodeURIComponent(searchQuery.trim())}`);
      }
      setSearchQuery('');
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleNavigate = (path: string) => {
    navigate(path);
    setSidebarOpen(false);
  };

  const toggleSidebar = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };

  // Filter menu based on user role. Super Admin HANYA akses: Dashboard + Monitoring, Order Stats, Logs, Maintenance, Language, Deploy (tidak ada Orders, Invoices, dll)
  const filteredMenuItems = user
    ? user.role === 'super_admin'
      ? menuItems.filter(item => item.roles.includes('super_admin') && (item.path === '/dashboard' || item.path.startsWith('/dashboard/super-admin')))
      : menuItems.filter(item => item.roles.includes(user.role))
    : [];

  const currentPage = filteredMenuItems.find(item => item.path === location.pathname);

  const userMenuItems = [
    ...(user?.role !== 'super_admin'
      ? [
          { id: 'profile', label: 'My Profile', icon: <User className="w-4 h-4" />, onClick: () => navigate('/dashboard/profile') },
          { id: 'settings', label: 'Settings', icon: <Settings className="w-4 h-4" />, onClick: () => navigate('/dashboard/settings') }
        ]
      : []),
    {
      id: 'logout',
      label: 'Logout',
      icon: <LogOut className="w-4 h-4" />,
      onClick: handleLogout,
      danger: true,
      divider: true
    }
  ];

  const Sidebar = ({ mobile = false }) => {
    const isCollapsed = !mobile && sidebarCollapsed;
    
    return (
      <div className="h-full flex flex-col bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 border-r border-slate-700/50 overflow-hidden">
        {/* Logo */}
        <div className={`px-4 py-5 flex items-center ${isCollapsed ? 'justify-center' : 'justify-between'} border-b border-slate-700/50`}>
          {!isCollapsed && (
            <div className="flex items-center gap-3">
              <div className="relative group">
                <div className="absolute inset-0 bg-gradient-to-r from-emerald-600 to-teal-600 rounded-xl blur opacity-50 group-hover:opacity-75 transition-opacity"></div>
                <div className="relative w-9 h-9 bg-gradient-to-r from-emerald-600 to-teal-600 rounded-xl flex items-center justify-center overflow-hidden p-0.5">
                  <img src={logo} alt="Logo" className="w-full h-full object-cover rounded-lg" />
                </div>
              </div>
              <div>
                <h1 className="text-base font-bold text-white">Bintang Global</h1>
                <p className="text-xs text-emerald-400">Travel Management</p>
              </div>
            </div>
          )}
          {isCollapsed && (
            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-r from-emerald-600 to-teal-600 rounded-xl blur opacity-50 group-hover:opacity-75 transition-opacity"></div>
              <div className="relative w-9 h-9 bg-gradient-to-r from-emerald-600 to-teal-600 rounded-xl flex items-center justify-center overflow-hidden p-0.5">
                <img src={logo} alt="Logo" className="w-full h-full object-cover rounded-lg" />
              </div>
            </div>
          )}
          {mobile && (
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden text-slate-400 hover:text-white p-1 hover:bg-slate-700/50 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto overflow-x-hidden">
          {filteredMenuItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <div key={item.path} className="relative">
                <button
                  onClick={() => handleNavigate(item.path)}
                  className={`w-full flex items-center ${isCollapsed ? 'justify-center px-3' : 'gap-3 px-3'} py-2.5 rounded-xl text-sm font-semibold transition-all group ${
                    isActive
                      ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-lg shadow-emerald-600/30'
                      : 'text-slate-300 hover:bg-white/5 hover:text-white'
                  }`}
                  title={isCollapsed ? item.title : ''}
                >
                  <span className={isActive ? 'text-white' : 'text-slate-400 group-hover:text-emerald-400'}>
                    {item.icon}
                  </span>
                  {!isCollapsed && (
                    <>
                      <span className="flex-1 text-left">{item.title}</span>
                      {item.badge && (
                        <Badge variant="error" size="sm">
                          {item.badge}
                        </Badge>
                      )}
                      {isActive && <ChevronRight className="w-4 h-4 ml-auto" />}
                    </>
                  )}
                </button>
                {/* Tooltip for collapsed state */}
                {isCollapsed && (
                  <div className="fixed ml-20 px-3 py-2 bg-slate-800 border border-slate-700 text-white text-xs rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all whitespace-nowrap pointer-events-none shadow-xl z-50">
                    {item.title}
                  </div>
                )}
              </div>
            );
          })}
        </nav>

        {/* User Profile */}
        {!isCollapsed && (
          <div className="p-4 border-t border-slate-700/50">
            <div className="flex items-center gap-3 px-2 py-2 bg-white/5 rounded-xl border border-slate-700/50 hover:border-emerald-500/50 transition-colors">
              <div className="w-9 h-9 bg-gradient-to-br from-emerald-600 to-teal-600 rounded-full flex items-center justify-center text-sm font-semibold text-white shadow-lg shadow-emerald-600/30">
                {user?.name.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-white truncate">{user?.name}</p>
                <p className="text-xs text-emerald-400 truncate">{user ? ROLE_NAMES[user.role] : ''}</p>
              </div>
            </div>
          </div>
        )}

        {/* Collapsed User Profile */}
        {isCollapsed && (
          <div className="p-3 border-t border-slate-700/50 flex justify-center">
            <div className="w-9 h-9 bg-gradient-to-br from-emerald-600 to-teal-600 rounded-full flex items-center justify-center text-sm font-semibold text-white shadow-lg shadow-emerald-600/30">
              {user?.name.charAt(0).toUpperCase()}
            </div>
          </div>
        )}

        {/* Collapse Toggle Button - Desktop Only */}
        {!mobile && (
          <div className="p-3 border-t border-slate-700/50">
            <button
              onClick={toggleSidebar}
              className="w-full flex items-center justify-center gap-2 px-3 py-2 text-slate-400 hover:bg-white/5 hover:text-emerald-400 rounded-xl transition-colors group"
            >
              {isCollapsed ? (
                <ChevronRight className="w-5 h-5" />
              ) : (
                <>
                  <ChevronLeft className="w-5 h-5" />
                  <span className="text-sm font-semibold">Collapse</span>
                </>
              )}
            </button>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen app-bg flex overflow-x-hidden">
      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Mobile Sidebar */}
      <div
        className={`fixed inset-y-0 left-0 w-64 z-50 transform transition-transform duration-300 lg:hidden ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <Sidebar mobile />
      </div>

      {/* Desktop Sidebar */}
      <div className={`hidden lg:block flex-shrink-0 transition-all duration-300 ${sidebarCollapsed ? 'w-20' : 'w-64'}`}>
        <div className={`fixed h-screen transition-all duration-300 ${sidebarCollapsed ? 'w-20' : 'w-64'}`}>
          <Sidebar />
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-h-screen overflow-x-hidden">
        {/* Top Navbar */}
        <header className="bg-white border-b border-slate-200/80 sticky top-0 z-30 shadow-sm">
          <div className="px-6 py-4 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden text-slate-600 hover:text-emerald-600 transition-colors"
              >
                <Menu className="w-5 h-5" />
              </button>
              <div>
                <h2 className="text-xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">
                  {currentPage?.title || 'Dashboard'}
                </h2>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {/* Search */}
              <div ref={searchRef} className="hidden md:block relative">
                {searchOpen ? (
                  <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg min-w-[220px]">
                    <Search className="w-4 h-4 text-slate-500 flex-shrink-0" />
                    <input
                      ref={searchInputRef}
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      onKeyDown={handleSearchKeyDown}
                      placeholder="Cari order (Enter untuk buka Orders)..."
                      className="flex-1 bg-transparent text-sm text-slate-900 placeholder-slate-500 outline-none min-w-0"
                    />
                    <kbd className="hidden lg:inline-block px-1.5 py-0.5 text-xs text-slate-400 border border-slate-200 rounded">Esc</kbd>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => setSearchOpen(true)}
                    className="flex items-center gap-2 px-3 py-2 text-sm text-slate-500 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg transition-colors"
                  >
                    <Search className="w-4 h-4" />
                    <span>Search...</span>
                    <kbd className="hidden lg:inline-block px-2 py-0.5 text-xs font-semibold text-slate-500 bg-white border border-slate-200 rounded">⌘K</kbd>
                  </button>
                )}
              </div>

              {/* Notifications */}
              <div ref={notificationRef} className="relative">
                <button
                  type="button"
                  onClick={() => setNotificationOpen(!notificationOpen)}
                  className="relative p-2 text-slate-600 hover:text-emerald-600 hover:bg-slate-50 rounded-lg transition-colors"
                >
                  <Bell className="w-5 h-5" />
                  {notifications.length > 0 && (
                    <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full ring-2 ring-white" />
                  )}
                </button>
                {notificationOpen && (
                  <div className="absolute right-0 mt-2 w-80 max-h-96 overflow-y-auto bg-white rounded-xl shadow-2xl border border-slate-200 py-2 z-50">
                    <div className="px-4 py-2 border-b border-slate-100">
                      <h3 className="text-sm font-semibold text-slate-900">Notifikasi</h3>
                    </div>
                    {notifications.length === 0 ? (
                      <p className="px-4 py-6 text-sm text-slate-500 text-center">Tidak ada notifikasi baru</p>
                    ) : (
                      <ul className="py-1">
                        {notifications.map((n) => (
                          <li key={n.id}>
                            <button
                              type="button"
                              onClick={() => { setNotificationOpen(false); navigate('/dashboard'); }}
                              className="w-full px-4 py-3 text-left text-sm hover:bg-slate-50 transition-colors border-b border-slate-50 last:border-0"
                            >
                              <p className="font-medium text-slate-900">{n.title}</p>
                              <p className="text-slate-500 mt-0.5 line-clamp-2">{n.message}</p>
                            </button>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                )}
              </div>

              {/* User Menu */}
              <Dropdown
                trigger={
                  <div className="flex items-center gap-2 px-3 py-2 hover:bg-slate-50 rounded-lg cursor-pointer transition-colors border border-transparent hover:border-slate-200">
                    <div className="w-8 h-8 bg-gradient-to-br from-emerald-600 to-teal-600 rounded-full flex items-center justify-center text-white text-sm font-semibold shadow-lg shadow-emerald-600/30">
                      {user?.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="hidden md:block text-left">
                      <p className="text-sm font-semibold text-slate-900">{user?.name}</p>
                      <p className="text-xs text-slate-500">{user ? ROLE_NAMES[user.role] : ''}</p>
                    </div>
                  </div>
                }
                items={userMenuItems}
                align="right"
              />
            </div>
          </div>
        </header>

        {/* Page Content — Super Admin hanya boleh di /dashboard dan /dashboard/super-admin/* */}
        <main className="flex-1 p-6">
          <div className="mb-4">
            <MaintenanceBanner />
          </div>
          {user?.role === 'super_admin' && location.pathname !== '/dashboard' && !location.pathname.startsWith('/dashboard/super-admin') ? (
            <Navigate to="/dashboard" replace />
          ) : (
            <Outlet />
          )}
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;