import { User as UserType } from '../types';

// Re-export the User type
export type User = UserType;

/**
 * Mock Users Data
 * Sample user accounts for testing
 */

export const mockUsers: User[] = [
  {
    id: '1',
    name: 'Super Admin',
    email: 'superadmin@bintangglobal.com',
    role: 'super_admin',
    phone: '+62 21 8094 5678',
    is_active: true,
    created_at: '2024-01-01T00:00:00Z',
    last_login: '2026-02-14T08:00:00Z'
  },
  {
    id: '2',
    name: 'Admin Pusat Jakarta',
    email: 'adminpusat@bintangglobal.com',
    role: 'admin_pusat',
    phone: '+62 21 8094 5679',
    branch_id: 'branch-1',
    branch_name: 'Kantor Pusat Jakarta',
    is_active: true,
    created_at: '2024-01-01T00:00:00Z',
    last_login: '2026-02-14T07:30:00Z'
  },
  {
    id: '3',
    name: 'Admin Cabang Surabaya',
    email: 'admincabang.surabaya@bintangglobal.com',
    role: 'admin_cabang',
    phone: '+62 31 5687 4321',
    branch_id: 'branch-2',
    branch_name: 'Cabang Surabaya',
    is_active: true,
    created_at: '2024-01-01T00:00:00Z',
    last_login: '2026-02-13T16:00:00Z'
  },
  {
    id: '4',
    name: 'Staff Invoice',
    email: 'invoice@bintangglobal.com',
    role: 'role_invoice',
    phone: '+62 21 8094 5680',
    branch_id: 'branch-1',
    is_active: true,
    created_at: '2024-01-01T00:00:00Z',
    last_login: '2026-02-14T09:00:00Z'
  },
  {
    id: '5',
    name: 'Staff Hotel',
    email: 'hotel@bintangglobal.com',
    role: 'role_hotel',
    phone: '+62 21 8094 5681',
    branch_id: 'branch-1',
    is_active: true,
    created_at: '2024-01-01T00:00:00Z',
    last_login: '2026-02-14T08:30:00Z'
  },
  {
    id: '6',
    name: 'Staff Visa',
    email: 'visa@bintangglobal.com',
    role: 'role_visa',
    phone: '+62 21 8094 5682',
    branch_id: 'branch-1',
    is_active: true,
    created_at: '2024-01-01T00:00:00Z',
    last_login: '2026-02-14T08:15:00Z'
  },
  {
    id: '7',
    name: 'Staff Bus',
    email: 'bus@bintangglobal.com',
    role: 'role_bus',
    phone: '+62 21 8094 5683',
    branch_id: 'branch-1',
    is_active: true,
    created_at: '2024-01-01T00:00:00Z',
    last_login: '2026-02-13T17:00:00Z'
  },
  {
    id: '8',
    name: 'Staff Ticket',
    email: 'ticket@bintangglobal.com',
    role: 'role_ticket',
    phone: '+62 21 8094 5684',
    branch_id: 'branch-1',
    is_active: true,
    created_at: '2024-01-01T00:00:00Z',
    last_login: '2026-02-14T07:45:00Z'
  },
  {
    id: '9',
    name: 'Staff Accounting',
    email: 'accounting@bintangglobal.com',
    role: 'role_accounting',
    phone: '+62 21 8094 5685',
    branch_id: 'branch-1',
    is_active: true,
    created_at: '2024-01-01T00:00:00Z',
    last_login: '2026-02-14T09:15:00Z'
  },
  {
    id: '10',
    name: 'H. Ahmad Fadli',
    email: 'owner@example.com',
    role: 'owner',
    phone: '+62 812 3456 7890',
    company_name: 'Al-Hijrah Travel & Tours',
    branch_id: 'branch-1',
    branch_name: 'Kantor Pusat Jakarta',
    is_active: true,
    created_at: '2024-01-15T00:00:00Z',
    last_login: '2026-02-14T10:00:00Z'
  },
  {
    id: '11',
    name: 'Hj. Siti Nurhaliza',
    email: 'barokah@example.com',
    role: 'owner',
    phone: '+62 813 4567 8901',
    company_name: 'Barokah Tour & Travel',
    branch_id: 'branch-2',
    branch_name: 'Cabang Surabaya',
    is_active: true,
    created_at: '2024-01-20T00:00:00Z',
    last_login: '2026-02-13T14:30:00Z'
  },
  {
    id: '12',
    name: 'H. Budi Santoso',
    email: 'madinah.express@example.com',
    role: 'owner',
    phone: '+62 814 5678 9012',
    company_name: 'Madinah Express Indonesia',
    branch_id: 'branch-1',
    is_active: true,
    created_at: '2024-02-01T00:00:00Z',
    last_login: '2026-02-14T09:20:00Z'
  }
];

export const DEFAULT_PASSWORD = 'password123';