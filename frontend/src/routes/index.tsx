import { createBrowserRouter, Navigate } from 'react-router-dom';
import ProtectedRoute from '../components/ProtectedRoute';
import MaintenanceGate from '../components/MaintenanceGate';
import DashboardLayout from '../layouts/DashboardLayout';
import LoginPage from '../pages/auth/LoginPage';
import RegisterPage from '../pages/auth/RegisterPage';
import DashboardRouter from '../pages/dashboard/DashboardRouter';
import SuperAdminDashboard from '../pages/dashboard/roles/SuperAdminDashboard';
import SuperAdminLogsPage from '../pages/dashboard/superadmin/SuperAdminLogsPage';
import SuperAdminMaintenancePage from '../pages/dashboard/superadmin/SuperAdminMaintenancePage';
import ProductsPage from '../pages/dashboard/components/ProductsPage';
import OrderFormPage from '../pages/dashboard/components/OrderFormPage';
import UsersPage from '../pages/dashboard/components/UsersPage';
import BranchesPage from '../pages/dashboard/components/BranchesPage';
import ReportsPage from '../pages/dashboard/components/ReportsPage';
import SettingsPage from '../pages/dashboard/components/SettingsPage';
import KoordinatorOwnersPage from '../pages/dashboard/components/KoordinatorOwnersPage';
import KoordinatorDashboard from '../pages/dashboard/roles/KoordinatorDashboard';
import AdminPusatCreateUserPage from '../pages/dashboard/adminpusat/AdminPusatCreateUserPage';
import OrdersInvoicesPage from '../pages/dashboard/adminpusat/OrdersInvoicesPage';
import AccountingFinancialReportPage from '../pages/dashboard/accounting/AccountingFinancialReportPage';
import AccountingAgingPage from '../pages/dashboard/accounting/AccountingAgingPage';
import AccountingChartOfAccountsPage from '../pages/dashboard/accounting/AccountingChartOfAccountsPage';

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
        element: <MaintenanceGate />,
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
            path: 'products',
            element: <ProductsPage />
          },
          {
            path: 'hotels',
            element: <Navigate to="/dashboard/products?tab=hotels" replace />
          },
          {
            path: 'visa',
            element: <Navigate to="/dashboard/products?tab=visa" replace />
          },
          {
            path: 'tickets',
            element: <Navigate to="/dashboard/products?tab=tickets" replace />
          },
          {
            path: 'bus',
            element: <Navigate to="/dashboard/products?tab=bus" replace />
          },
          {
            path: 'handling',
            element: <Navigate to="/dashboard/products?tab=hotels" replace />
          },
          {
            path: 'packages',
            element: <Navigate to="/dashboard/products?tab=packages" replace />
          },
          // Order & Invoice: satu menu untuk semua role. Data sesuai hak akses. Tambah/Edit/Hapus order hanya owner & invoice_koordinator.
          {
            path: 'orders/new',
            element: <OrderFormPage />
          },
          {
            path: 'orders/:id/edit',
            element: <OrderFormPage />
          },
          {
            path: 'orders',
            element: <Navigate to="/dashboard/orders-invoices" replace />
          },
          {
            path: 'orders-invoices',
            element: <OrdersInvoicesPage />
          },
          {
            path: 'invoices',
            element: <Navigate to="/dashboard/orders-invoices" replace />
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
            path: 'koordinator',
            element: <KoordinatorDashboard />
          },
          {
            path: 'koordinator/owners',
            element: <KoordinatorOwnersPage />
          },
          {
            path: 'combined-recap',
            element: <Navigate to="/dashboard" replace />
          },
          {
            path: 'admin-pusat/users',
            element: <AdminPusatCreateUserPage />
          },
          {
            path: 'accounting/financial-report',
            element: <AccountingFinancialReportPage />
          },
          {
            path: 'accounting/chart-of-accounts',
            element: <AccountingChartOfAccountsPage />
          },
          {
            path: 'accounting/reconciliation',
            element: <Navigate to="/dashboard" replace />
          },
          {
            path: 'accounting/aging',
            element: <AccountingAgingPage />
          },
          {
            path: '*',
            element: <Navigate to="/dashboard" replace />
          }
            ]
          }
        ]
      }
    ]
  },
  {
    path: '*',
    element: <Navigate to="/dashboard" replace />
  }
]);

export default router;