import { createBrowserRouter, Navigate } from 'react-router-dom';
import ProtectedRoute from '../components/ProtectedRoute';
import DashboardLayout from '../layouts/DashboardLayout';
import LoginPage from '../pages/auth/LoginPage';

// Role-specific Dashboards
import SuperAdminDashboard from '../pages/dashboard/roles/SuperAdminDashboard';
import AdminPusatDashboard from '../pages/dashboard/roles/AdminPusatDashboard';
import AdminCabangDashboard from '../pages/dashboard/roles/AdminCabangDashboard';
import OwnerDashboard from '../pages/dashboard/roles/OwnerDashboard';
import InvoiceDashboard from '../pages/dashboard/roles/InvoiceDashboard';
import VisaDashboard from '../pages/dashboard/roles/VisaDashboard';
import HandlingDashboard from '../pages/dashboard/roles/HandlingDashboard';
import TicketDashboard from '../pages/dashboard/roles/TicketDashboard';
import BusDashboard from '../pages/dashboard/roles/BusDashboard';
import AccountingDashboard from '../pages/dashboard/roles/AccountingDashboard';

// Shared Dashboard Components
import HotelsPage from '../pages/dashboard/components/HotelsPage';
import VisaPage from '../pages/dashboard/components/VisaPage';
import TicketsPage from '../pages/dashboard/components/TicketsPage';
import BusPage from '../pages/dashboard/components/BusPage';
import HandlingPage from '../pages/dashboard/components/HandlingPage';
import PackagesPage from '../pages/dashboard/components/PackagesPage';
import OrdersPage from '../pages/dashboard/components/OrdersPage';
import InvoicesPage from '../pages/dashboard/components/InvoicesPage';
import UsersPage from '../pages/dashboard/components/UsersPage';
import BranchesPage from '../pages/dashboard/components/BranchesPage';
import ReportsPage from '../pages/dashboard/components/ReportsPage';
import SettingsPage from '../pages/dashboard/components/SettingsPage';

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
    path: '/dashboard',
    element: <ProtectedRoute />,
    children: [
      {
        element: <DashboardLayout />,
        children: [
          {
            index: true,
            element: <SuperAdminDashboard />
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
            path: 'handling',
            element: <HandlingPage />
          },
          {
            path: 'packages',
            element: <PackagesPage />
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
          }
        ]
      }
    ]
  }
]);

export default router;