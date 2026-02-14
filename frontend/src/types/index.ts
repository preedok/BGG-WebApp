// ============================================
// USER & AUTHENTICATION TYPES
// ============================================

export type UserRole =
  | 'super_admin'
  | 'admin_pusat'
  | 'admin_cabang'
  | 'role_invoice'
  | 'role_handling'
  | 'role_visa'
  | 'role_bus'
  | 'role_ticket'
  | 'role_accounting'
  | 'owner';

export const ROLE_NAMES: Record<UserRole, string> = {
  super_admin: 'Super Admin',
  admin_pusat: 'Admin Pusat',
  admin_cabang: 'Admin Cabang',
  role_invoice: 'Role Invoice',
  role_handling: 'Role Handling',
  role_visa: 'Role Visa',
  role_bus: 'Role Bus',
  role_ticket: 'Role Ticket',
  role_accounting: 'Role Accounting',
  owner: 'Owner'
};

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  phone?: string;
  company_name?: string;
  branch_id?: string;
  branch_name?: string;
  is_active: boolean;
  avatar?: string;
  created_at: string;
  last_login?: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface LoginResponse {
  success: boolean;
  message: string;
  data?: {
    user: User;
    token: string;
  };
}

// ============================================
// ORDER & INVOICE TYPES
// ============================================

export type OrderStatus =
  | 'draft'
  | 'pending'
  | 'confirmed'
  | 'processing'
  | 'completed'
  | 'cancelled';

export type InvoiceStatus =
  | 'tentative'
  | 'definite'
  | 'partial'
  | 'paid'
  | 'overdue'
  | 'cancelled';

export interface Order {
  id: string;
  order_number: string;
  owner_name: string;
  package_name: string;
  amount: string;
  status: OrderStatus;
  date: string;
}

// ============================================
// DASHBOARD TYPES
// ============================================

export interface DashboardStat {
  title: string;
  value: string;
  change: string;
  trend: 'up' | 'down';
  icon: React.ReactNode;
  color: string;
}

export interface BranchPerformance {
  name: string;
  orders: number;
  revenue: string;
  growth: number;
}

export interface ProductStat {
  name: string;
  count: number;
  percentage: number;
}

// ============================================
// COMPONENT TYPES
// ============================================

export interface MenuItem {
  title: string;
  icon: React.ReactNode;
  path: string;
  roles: UserRole[];
  badge?: string;
}

export interface TableColumn {
  id: string;
  label: string;
  align?: 'left' | 'center' | 'right';
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  time: string;
  read: boolean;
  type: 'info' | 'success' | 'warning' | 'error';
}

// ============================================
// DROPDOWN TYPES
// ============================================

export interface DropdownItem {
  id: string;
  label: string;
  icon?: React.ReactNode;
  onClick?: () => void;
  danger?: boolean;
  divider?: boolean;
}

// ============================================
// COMMON COMPONENT PROPS
// ============================================

export type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
export type ButtonSize = 'sm' | 'md' | 'lg';

export type BadgeVariant = 'default' | 'success' | 'warning' | 'error' | 'info';
export type BadgeSize = 'sm' | 'md' | 'lg';

export type CardPadding = 'none' | 'sm' | 'md' | 'lg';