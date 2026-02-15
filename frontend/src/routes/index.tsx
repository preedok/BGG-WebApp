import { createBrowserRouter, Navigate } from 'react-router-dom';
import ProtectedRoute from '../components/ProtectedRoute';
import DashboardLayout from '../layouts/DashboardLayout';
import LoginPage from '../pages/auth/LoginPage';
import RegisterPage from '../pages/auth/RegisterPage';
import DashboardRouter from '../pages/dashboard/DashboardRouter';
import SuperAdminDashboard from '../pages/dashboard/roles/SuperAdminDashboard';
import SuperAdminLogsPage from '../pages/dashboard/superadmin/SuperAdminLogsPage';
import SuperAdminMaintenancePage from '../pages/dashboard/superadmin/SuperAdminMaintenancePage';
import SuperAdminAppearancePage from '../pages/dashboard/superadmin/SuperAdminAppearancePage';

// Shared Dashboard Components
import HotelsPage from '../pages/dashboard/components/HotelsPage';
import VisaPage from '../pages/dashboard/components/VisaPage';
import TicketsPage from '../pages/dashboard/components/TicketsPage';
import BusPage from '../pages/dashboard/components/BusPage';
import PackagesPage from '../pages/dashboard/components/PackagesPage';
import OrdersPage from '../pages/dashboard/components/OrdersPage';
import InvoicesPage from '../pages/dashboard/components/InvoicesPage';
import UsersPage from '../pages/dashboard/components/UsersPage';
import BranchesPage from '../pages/dashboard/components/BranchesPage';
import ReportsPage from '../pages/dashboard/components/ReportsPage';
import SettingsPage from '../pages/dashboard/components/SettingsPage';
import ProductsPage from '../pages/dashboard/components/ProductsPage';
import AdminCabangOwnersPage from '../pages/dashboard/components/AdminCabangOwnersPage';
import AdminCabangPersonilPage from '../pages/dashboard/components/AdminCabangPersonilPage';
import AdminPusatCombinedRecapPage from '../pages/dashboard/adminpusat/AdminPusatCombinedRecapPage';
import AdminPusatCreateUserPage from '../pages/dashboard/adminpusat/AdminPusatCreateUserPage';
import AdminPusatFlyersPage from '../pages/dashboard/adminpusat/AdminPusatFlyersPage';
import AccountingFinancialReportPage from '../pages/dashboard/accounting/AccountingFinancialReportPage';
import AccountingReconciliationPage from '../pages/dashboard/accounting/AccountingReconciliationPage';
import AccountingAgingPage from '../pages/dashboard/accounting/AccountingAgingPage';

const router = createBrowserRouter([
  {
    path: '/',
    element: <Navigate to="/dashboard" replace />
  },
  {
    path: '/login',
    element: <LoginPage />
  },
  {
    path: '/register',
    element: <RegisterPage />
  },
  {
    path: '/dashboard',
    element: <ProtectedRoute />,
    children: [
      {
        element: <DashboardLayout />,
        children: [
          {
            index: true,
            element: <DashboardRouter />
          },
          // Fallback for direct path (optional): /dashboard/super-admin
          {
            path: 'super-admin',
            element: <SuperAdminDashboard />
          },
          {
            path: 'super-admin/order-statistics',
            element: <Navigate to="/dashboard" replace />
          },
          {
            path: 'super-admin/logs',
            element: <SuperAdminLogsPage />
          },
          {
            path: 'super-admin/maintenance',
            element: <SuperAdminMaintenancePage />
          },
          {
            path: 'super-admin/appearance',
            element: <SuperAdminAppearancePage />
          },
          {
            path: 'hotels',
            element: <HotelsPage />
          },
          {
            path: 'visa',
            element: <VisaPage />
          },
          {
            path: 'tickets',
            element: <TicketsPage />
          },
          {
            path: 'bus',
            element: <BusPage />
          },
          {
            path: 'packages',
            element: <PackagesPage />
          },
          {
            path: 'products',
            element: <ProductsPage />
          },
          {
            path: 'orders',
            element: <OrdersPage />
          },
          {
            path: 'invoices',
            element: <InvoicesPage />
          },
          {
            path: 'users',
            element: <UsersPage />
          },
          {
            path: 'branches',
            element: <BranchesPage />
          },
          {
            path: 'reports',
            element: <ReportsPage />
          },
          {
            path: 'settings',
            element: <SettingsPage />
          },
          {
            path: 'admin-cabang/owners',
            element: <AdminCabangOwnersPage />
          },
          {
            path: 'admin-cabang/personil',
            element: <AdminCabangPersonilPage />
          },
          {
            path: 'combined-recap',
            element: <AdminPusatCombinedRecapPage />
          },
          {
            path: 'admin-pusat/users',
            element: <AdminPusatCreateUserPage />
          },
          {
            path: 'flyers',
            element: <AdminPusatFlyersPage />
          },
          {
            path: 'accounting/financial-report',
            element: <AccountingFinancialReportPage />
          },
          {
            path: 'accounting/reconciliation',
            element: <AccountingReconciliationPage />
          },
          {
            path: 'accounting/aging',
            element: <AccountingAgingPage />
          }
        ]
      }
    ]
  }
]);

export default router;