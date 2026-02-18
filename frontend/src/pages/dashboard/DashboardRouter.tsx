import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import SuperAdminDashboard from './roles/SuperAdminDashboard';
import AdminPusatDashboard from './roles/AdminPusatDashboard';
import AdminCabangDashboard from './roles/AdminCabangDashboard';
import KoordinatorDashboard from './roles/KoordinatorDashboard';
import OwnerDashboard from './roles/OwnerDashboard';
import InvoiceDashboard from './roles/InvoiceDashboard';
import HotelDashboard from './roles/HotelDashboard';
import VisaDashboard from './roles/VisaDashboard';
import TicketDashboard from './roles/TicketDashboard';
import BusDashboard from './roles/BusDashboard';
import AccountingDashboard from './roles/AccountingDashboard';
import { isKoordinatorRole } from '../../types';

/**
 * Menampilkan dashboard sesuai role user.
 * Super Admin & Admin Pusat: monitoring semua cabang.
 * Koordinator: dashboard wilayah (Bali-Nusa Tenggara, Jawa, Kalimantan).
 * Admin Cabang: monitoring cabang sendiri.
 * Owner / Invoice / Hotel / Visa / Ticket / Bus: rekapitulasi pekerjaan masing-masing.
 */
const DashboardRouter: React.FC = () => {
  const { user } = useAuth();
  const role = user?.role ?? 'owner';

  switch (role) {
    case 'super_admin':
      return <SuperAdminDashboard />;
    case 'admin_pusat':
      return <AdminPusatDashboard />;
    case 'admin_cabang':
      return <AdminCabangDashboard />;
    case 'admin_koordinator':
    case 'invoice_koordinator':
    case 'tiket_koordinator':
    case 'visa_koordinator':
      return <KoordinatorDashboard />;
    case 'owner':
      return <OwnerDashboard />;
    case 'invoice_koordinator':
    case 'role_invoice_saudi':
      return <InvoiceDashboard />;
    case 'role_hotel':
      return <HotelDashboard />;
    case 'role_visa':
      return <VisaDashboard />;
    case 'role_ticket':
      return <TicketDashboard />;
    case 'role_bus':
      return <BusDashboard />;
    case 'role_accounting':
      return <AccountingDashboard />;
    default:
      if (role && isKoordinatorRole(role as any)) return <KoordinatorDashboard />;
      return <OwnerDashboard />;
  }
};

export default DashboardRouter;
