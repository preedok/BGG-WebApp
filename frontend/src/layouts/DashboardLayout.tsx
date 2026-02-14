import React, { useState } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
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
  ChevronRight
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { MenuItem, UserRole, ROLE_NAMES } from '../types';
import Dropdown from '../components/common/Dropdown';
import Badge from '../components/common/Badge';

const menuItems: MenuItem[] = [
  {
    title: 'Dashboard',
    icon: <LayoutDashboard className="w-5 h-5" />,
    path: '/dashboard',
    roles: ['super_admin', 'admin_pusat', 'admin_cabang', 'role_invoice', 'role_handling', 'role_visa', 'role_bus', 'role_ticket', 'role_accounting', 'owner']
  },
  {
    title: 'Hotels',
    icon: <Hotel className="w-5 h-5" />,
    path: '/dashboard/hotels',
    roles: ['super_admin', 'admin_pusat', 'admin_cabang', 'role_handling', 'owner']
  },
  {
    title: 'Visa',
    icon: <FileText className="w-5 h-5" />,
    path: '/dashboard/visa',
    roles: ['super_admin', 'admin_pusat', 'role_visa', 'owner']
  },
  {
    title: 'Tickets',
    icon: <Plane className="w-5 h-5" />,
    path: '/dashboard/tickets',
    roles: ['super_admin', 'admin_pusat', 'role_ticket', 'owner']
  },
  {
    title: 'Bus',
    icon: <Bus className="w-5 h-5" />,
    path: '/dashboard/bus',
    roles: ['super_admin', 'admin_pusat', 'role_bus', 'owner']
  },
  {
    title: 'Packages',
    icon: <Package className="w-5 h-5" />,
    path: '/dashboard/packages',
    roles: ['super_admin', 'admin_pusat', 'owner']
  },
  {
    title: 'Orders',
    icon: <Receipt className="w-5 h-5" />,
    path: '/dashboard/orders',
    roles: ['super_admin', 'admin_pusat', 'admin_cabang', 'role_invoice', 'owner']
  },
  {
    title: 'Invoices',
    icon: <Receipt className="w-5 h-5" />,
    path: '/dashboard/invoices',
    roles: ['super_admin', 'admin_pusat', 'role_invoice', 'role_accounting', 'owner']
  },
  {
    title: 'Users',
    icon: <Users className="w-5 h-5" />,
    path: '/dashboard/users',
    roles: ['super_admin', 'admin_pusat', 'admin_cabang']
  },
  {
    title: 'Branches',
    icon: <Building2 className="w-5 h-5" />,
    path: '/dashboard/branches',
    roles: ['super_admin', 'admin_pusat']
  },
  {
    title: 'Reports',
    icon: <BarChart3 className="w-5 h-5" />,
    path: '/dashboard/reports',
    roles: ['super_admin', 'admin_pusat', 'role_accounting']
  },
  {
    title: 'Settings',
    icon: <Settings className="w-5 h-5" />,
    path: '/dashboard/settings',
    roles: ['super_admin', 'admin_pusat', 'admin_cabang', 'owner']
  }
];

const DashboardLayout: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleNavigate = (path: string) => {
    navigate(path);
    setSidebarOpen(false);
  };

  // Filter menu based on user role
  const filteredMenuItems = user
    ? menuItems.filter(item => item.roles.includes(user.role))
    : [];

  const currentPage = filteredMenuItems.find(item => item.path === location.pathname);

  const userMenuItems = [
    {
      id: 'profile',
      label: 'My Profile',
      icon: <User className="w-4 h-4" />,
      onClick: () => navigate('/dashboard/profile')
    },
    {
      id: 'settings',
      label: 'Settings',
      icon: <Settings className="w-4 h-4" />,
      onClick: () => navigate('/dashboard/settings')
    },
    {
      id: 'logout',
      label: 'Logout',
      icon: <LogOut className="w-4 h-4" />,
      onClick: handleLogout,
      danger: true,
      divider: true
    }
  ];

  const Sidebar = ({ mobile = false }) => (
    <div className="h-full flex flex-col bg-slate-900 text-white">
      {/* Logo */}
      <div className="p-6 flex items-center justify-between border-b border-slate-800">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-xl flex items-center justify-center">
            <Globe className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-lg font-bold">Bintang Global</h1>
            <p className="text-xs text-slate-400">Travel Management</p>
          </div>
        </div>
        {mobile && (
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden text-slate-400 hover:text-white"
          >
            <X className="w-6 h-6" />
          </button>
        )}
      </div>

      {/* User Info */}
      <div className="p-4">
        <div className="bg-slate-800 rounded-xl p-4 space-y-2">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-full flex items-center justify-center text-lg font-bold">
              {user?.name.charAt(0)}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold truncate">{user?.name}</p>
              <Badge variant="success" size="sm">
                {user ? ROLE_NAMES[user.role] : ''}
              </Badge>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-4 space-y-1">
        {filteredMenuItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <button
              key={item.path}
              onClick={() => handleNavigate(item.path)}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all ${
                isActive
                  ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-lg'
                  : 'text-slate-300 hover:bg-slate-800 hover:text-white'
              }`}
            >
              {item.icon}
              <span className="font-semibold text-sm">{item.title}</span>
              {item.badge && (
                <Badge variant="error" size="sm">
                  {item.badge}
                </Badge>
              )}
              {isActive && <ChevronRight className="w-4 h-4 ml-auto" />}
            </button>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-slate-800">
        <p className="text-xs text-slate-500 text-center">Version 1.0.0</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Mobile Sidebar */}
      <div
        className={`fixed inset-y-0 left-0 w-72 z-50 transform transition-transform duration-300 lg:hidden ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <Sidebar mobile />
      </div>

      {/* Desktop Sidebar */}
      <div className="hidden lg:block w-72 flex-shrink-0">
        <div className="fixed w-72 h-screen">
          <Sidebar />
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-h-screen">
        {/* Top Navbar */}
        <header className="bg-white border-b border-slate-200 sticky top-0 z-30">
          <div className="px-6 py-4 flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden text-slate-600 hover:text-slate-900"
              >
                <Menu className="w-6 h-6" />
              </button>
              <h2 className="text-2xl font-bold text-slate-900">
                {currentPage?.title || 'Dashboard'}
              </h2>
            </div>

            <div className="flex items-center space-x-4">
              {/* Notifications */}
              <button className="relative p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-colors">
                <Bell className="w-6 h-6" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
              </button>

              {/* User Menu */}
              <Dropdown
                trigger={
                  <div className="flex items-center space-x-3 px-4 py-2 hover:bg-slate-100 rounded-xl cursor-pointer transition-colors">
                    <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-full flex items-center justify-center text-white font-bold">
                      {user?.name.charAt(0)}
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

        {/* Page Content */}
        <main className="flex-1 p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;