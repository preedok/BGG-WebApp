import axios, { AxiosError } from 'axios';
import { API_BASE_URL } from '../utils/constants';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
  withCredentials: true
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('bintang_global_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (err: AxiosError) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('bintang_global_token');
      localStorage.removeItem('bintang_global_user');
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(err);
  }
);

export const authApi = {
  login: (email: string, password: string) =>
    api.post<{ success: boolean; message?: string; data?: { user: any; token: string } }>('/auth/login', { email, password }),
  me: () => api.get<{ success: boolean; data: any }>('/auth/me')
};

export const superAdminApi = {
  getMonitoring: (params?: { branch_id?: string; role?: string }) => api.get('/super-admin/monitoring', { params }),
  getOrderStatistics: (params?: { period?: string; branch_id?: string }) => api.get('/super-admin/order-statistics', { params }),
  getLogs: (params?: { source?: string; level?: string; q?: string; page?: number; limit?: number }) => api.get('/super-admin/logs', { params }),
  createLog: (body: { source?: string; level?: string; message: string; meta?: object }) => api.post('/super-admin/logs', body),
  listMaintenance: (params?: { active_only?: string }) => api.get('/super-admin/maintenance', { params }),
  createMaintenance: (body: { title: string; message: string; type?: string; block_app?: boolean; starts_at?: string; ends_at?: string }) => api.post('/super-admin/maintenance', body),
  updateMaintenance: (id: string, body: object) => api.patch(`/super-admin/maintenance/${id}`, body),
  deleteMaintenance: (id: string) => api.delete(`/super-admin/maintenance/${id}`),
  getSettings: () => api.get('/super-admin/settings'),
  updateSettings: (body: object) => api.put('/super-admin/settings', body),
  listTemplates: () => api.get('/super-admin/templates'),
  activateTemplate: (id: string) => api.post(`/super-admin/templates/${id}/activate`),
  exportMonitoringExcel: (params?: { period?: string; branch_id?: string; role?: string }) =>
    api.get('/super-admin/export-monitoring-excel', { params, responseType: 'blob' }),
  exportMonitoringPdf: (params?: { period?: string; branch_id?: string; role?: string }) =>
    api.get('/super-admin/export-monitoring-pdf', { params, responseType: 'blob' }),
  exportLogsExcel: (params?: { source?: string; level?: string; limit?: number }) =>
    api.get('/super-admin/export-logs-excel', { params, responseType: 'blob' }),
  exportLogsPdf: (params?: { source?: string; level?: string; limit?: number }) =>
    api.get('/super-admin/export-logs-pdf', { params, responseType: 'blob' })
};

export const publicApi = {
  getActiveMaintenance: () => api.get('/super-admin/maintenance/active'),
  getPublicSettings: () => api.get('/super-admin/settings/public'),
  getI18n: (locale: string) => api.get(`/i18n/${locale}`)
};

export const productsApi = {
  list: (params?: { type?: string; with_prices?: string; branch_id?: string; owner_id?: string; is_package?: string; include_inactive?: string; limit?: number; page?: number; sort_by?: string; sort_order?: 'asc' | 'desc' }) => api.get('/products', { params }),
  getById: (id: string) => api.get(`/products/${id}`),
  getPrice: (id: string, params?: { branch_id?: string; owner_id?: string; currency?: string; room_type?: string; with_meal?: string }) => api.get(`/products/${id}/price`, { params }),
  listPrices: (params?: { product_id?: string; branch_id?: string }) => api.get('/products/prices', { params }),
  create: (body: { type: string; code?: string; name: string; description?: string; is_package?: boolean; meta?: object }) => api.post('/products', body),
  createHotel: (body: { name: string; description?: string; meta?: object }) => api.post('/products/hotels', body),
  update: (id: string, body: object) => api.patch(`/products/${id}`, body),
  delete: (id: string) => api.delete(`/products/${id}`),
  createPrice: (body: object) => api.post('/products/prices', body),
  updatePrice: (id: string, body: object) => api.patch(`/products/prices/${id}`, body),
  deletePrice: (id: string) => api.delete(`/products/prices/${id}`)
};

export const businessRulesApi = {
  get: (params?: { branch_id?: string }) => api.get('/business-rules', { params }),
  set: (body: { branch_id?: string; rules: object }) => api.put('/business-rules', body)
};

export const ordersApi = {
  list: (params?: { status?: string; branch_id?: string; owner_id?: string; limit?: number; page?: number; sort_by?: string; sort_order?: 'asc' | 'desc'; date_from?: string; date_to?: string; order_number?: string; provinsi_id?: string; wilayah_id?: string }) => api.get('/orders', { params }),
  getById: (id: string) => api.get(`/orders/${id}`),
  create: (body: object) => api.post('/orders', body),
  update: (id: string, body: object) => api.patch(`/orders/${id}`, body),
  delete: (id: string) => api.delete(`/orders/${id}`)
};

export const hotelApi = {
  getDashboard: () => api.get('/hotel/dashboard'),
  listOrders: (params?: { status?: string }) => api.get('/hotel/orders', { params }),
  getOrder: (id: string) => api.get(`/hotel/orders/${id}`),
  listProducts: () => api.get('/hotel/products'),
  updateItemProgress: (orderItemId: string, body: { status?: string; room_number?: string; meal_status?: string; check_in_date?: string; check_out_date?: string; notes?: string }) =>
    api.patch(`/hotel/order-items/${orderItemId}/progress`, body)
};

export const ticketApi = {
  getDashboard: () => api.get<{ success: boolean; data: TicketDashboardData }>('/ticket/dashboard'),
  listOrders: (params?: { status?: string }) => api.get<{ success: boolean; data: Order[] }>('/ticket/orders', { params }),
  getOrder: (id: string) => api.get<{ success: boolean; data: Order }>(`/ticket/orders/${id}`),
  updateItemProgress: (orderItemId: string, body: { status?: string; notes?: string }) =>
    api.patch(`/ticket/order-items/${orderItemId}/progress`, body),
  uploadTicket: (orderItemId: string, formData: FormData, setStatusIssued?: boolean) => {
    if (setStatusIssued) formData.append('set_status_issued', '1');
    return api.post(`/ticket/order-items/${orderItemId}/upload-ticket`, formData, { headers: { 'Content-Type': 'multipart/form-data' } });
  },
  exportExcel: () => api.get('/ticket/export-excel', { responseType: 'blob' })
};

export const visaApi = {
  getDashboard: () => api.get<{ success: boolean; data: VisaDashboardData }>('/visa/dashboard'),
  listOrders: (params?: { status?: string }) => api.get<{ success: boolean; data: Order[] }>('/visa/orders', { params }),
  getOrder: (id: string) => api.get<{ success: boolean; data: Order }>(`/visa/orders/${id}`),
  updateItemProgress: (orderItemId: string, body: { status?: string; notes?: string }) =>
    api.patch(`/visa/order-items/${orderItemId}/progress`, body),
  uploadVisa: (orderItemId: string, formData: FormData, setStatusIssued?: boolean) => {
    if (setStatusIssued) formData.append('set_status_issued', '1');
    return api.post(`/visa/order-items/${orderItemId}/upload-visa`, formData, { headers: { 'Content-Type': 'multipart/form-data' } });
  },
  exportExcel: () => api.get('/visa/export-excel', { responseType: 'blob' })
};

export const busApi = {
  getDashboard: () => api.get<{ success: boolean; data: BusDashboardData }>('/bus/dashboard'),
  listOrders: (params?: { status?: string }) => api.get<{ success: boolean; data: Order[] }>('/bus/orders', { params }),
  getOrder: (id: string) => api.get<{ success: boolean; data: Order }>(`/bus/orders/${id}`),
  listProducts: () => api.get<{ success: boolean; data: BusProduct[] }>('/bus/products'),
  updateItemProgress: (orderItemId: string, body: { bus_ticket_status?: string; bus_ticket_info?: string; arrival_status?: string; departure_status?: string; return_status?: string; notes?: string }) =>
    api.patch(`/bus/order-items/${orderItemId}/progress`, body),
  exportExcel: () => api.get('/bus/export-excel', { responseType: 'blob' }),
  exportPdf: () => api.get('/bus/export-pdf', { responseType: 'blob' })
};

// Minimal types for ticket dashboard/orders
interface TicketDashboardData {
  total_orders: number;
  total_ticket_items: number;
  by_status: Record<string, number>;
  pending_list: Array<{
    order_id: string;
    order_number: string;
    order_item_id: string;
    owner_name?: string;
    status: string;
    manifest_file_url?: string;
    ticket_file_url?: string;
    issued_at?: string;
  }>;
}
interface Order {
  id: string;
  order_number: string;
  status?: string;
  User?: { id: string; name: string; email?: string; company_name?: string };
  Branch?: { id: string; code: string; name: string };
  OrderItems?: OrderItem[];
}
interface OrderItem {
  id: string;
  type: string;
  quantity: number;
  manifest_file_url?: string;
  meta?: object;
  TicketProgress?: { id: string; status: string; ticket_file_url?: string; issued_at?: string; notes?: string };
  VisaProgress?: { id: string; status: string; visa_file_url?: string; issued_at?: string; notes?: string };
  BusProgress?: { id: string; bus_ticket_status: string; bus_ticket_info?: string; arrival_status: string; departure_status: string; return_status: string; notes?: string };
}

interface BusDashboardData {
  total_orders: number;
  total_bus_items: number;
  bus_ticket: { pending: number; issued: number };
  arrival: Record<string, number>;
  departure: Record<string, number>;
  return: Record<string, number>;
  pending_list: Array<{
    order_id: string;
    order_number: string;
    order_item_id: string;
    owner_name?: string;
    quantity: number;
    bus_ticket_status: string;
    arrival_status: string;
    departure_status: string;
    return_status: string;
  }>;
}

interface BusProduct {
  id: string;
  code: string;
  name: string;
  price_general: number | null;
  price_branch: number | null;
  currency: string;
  special_prices: Array<{ owner_id: string; owner_name: string; amount: number; currency: string }>;
}

interface VisaDashboardData {
  total_orders: number;
  total_visa_items: number;
  by_status: Record<string, number>;
  pending_list: Array<{
    order_id: string;
    order_number: string;
    order_item_id: string;
    owner_name?: string;
    status: string;
    manifest_file_url?: string;
    visa_file_url?: string;
    issued_at?: string;
  }>;
}

export interface InvoicesSummaryData {
  total_invoices: number;
  total_orders: number;
  total_amount: number;
  total_paid: number;
  total_remaining: number;
  by_invoice_status: Record<string, number>;
  by_order_status: Record<string, number>;
}

export const invoicesApi = {
  list: (params?: { status?: string; branch_id?: string; provinsi_id?: string; wilayah_id?: string; owner_id?: string; order_status?: string; invoice_number?: string; order_number?: string; date_from?: string; date_to?: string; due_status?: string; limit?: number; page?: number; sort_by?: string; sort_order?: 'asc' | 'desc' }) => api.get('/invoices', { params }),
  getSummary: (params?: { status?: string; branch_id?: string; owner_id?: string; order_status?: string; invoice_number?: string; order_number?: string; date_from?: string; date_to?: string; due_status?: string }) =>
    api.get<{ success: boolean; data: InvoicesSummaryData }>('/invoices/summary', { params }),
  getById: (id: string) => api.get(`/invoices/${id}`),
  getPdf: (id: string) => api.get(`/invoices/${id}/pdf`, { responseType: 'blob' }),
  create: (body: { order_id: string; is_super_promo?: boolean }) => api.post('/invoices', body),
  unblock: (id: string) => api.patch(`/invoices/${id}/unblock`),
  verifyPayment: (id: string, body: { payment_proof_id: string; verified: boolean; notes?: string }) => api.post(`/invoices/${id}/verify-payment`, body),
  handleOverpaid: (id: string, body: { handling: string; target_invoice_id?: string; target_order_id?: string }) => api.patch(`/invoices/${id}/overpaid`, body),
  uploadPaymentProof: (id: string, formData: FormData) => api.post(`/invoices/${id}/payment-proofs`, formData, { headers: { 'Content-Type': 'multipart/form-data' } })
};

export interface ProvinceItem {
  id: string | number;
  kode?: string;
  nama?: string;
  name?: string;
  wilayah_id?: string;
  wilayah?: string;
}

export interface KabupatenItem {
  id: string | number;
  nama: string;
}

export const branchesApi = {
  list: (params?: { limit?: number; page?: number; include_inactive?: string; search?: string; region?: string; provinsi_id?: string; wilayah_id?: string; city?: string; is_active?: string; sort_by?: string; sort_order?: 'asc' | 'desc' }) => api.get<{ success: boolean; data: Branch[]; pagination?: { total: number; page: number; limit: number; totalPages: number } }>('/branches', { params }),
  listPublic: (params?: { search?: string; region?: string; limit?: number }) => api.get<{ success: boolean; data: Branch[] }>('/branches/public', { params }),
  listProvinces: () => api.get<{ success: boolean; data: ProvinceItem[] }>('/branches/provinces'),
  listWilayah: () => api.get<{ success: boolean; data: Array<{ id: string; name: string }> }>('/branches/wilayah'),
  listKabupaten: (provinceId: string | number) => api.get<{ success: boolean; data: KabupatenItem[] }>(`/branches/kabupaten/${provinceId}`),
  getById: (id: string) => api.get<{ success: boolean; data: Branch }>(`/branches/${id}`),
  create: (body: BranchCreateBody) => api.post<{ success: boolean; data: Branch; created_admin_account?: any }>('/branches', body),
  createBulkByProvince: (provinceId: string | number) => api.post<{ success: boolean; data: Branch[]; message: string; created: number }>('/branches/bulk-by-province', { province_id: provinceId }),
  update: (id: string, body: Partial<Branch> & { admin_account?: { name?: string; email?: string; password?: string } }) => api.patch<{ success: boolean; data: Branch }>(`/branches/${id}`, body)
};
export interface Branch {
  id: string;
  code: string;
  name: string;
  city: string;
  region?: string;
  manager_name?: string;
  phone?: string;
  email?: string;
  address?: string;
  koordinator_provinsi?: string;
  koordinator_provinsi_phone?: string;
  koordinator_provinsi_email?: string;
  koordinator_wilayah?: string;
  koordinator_wilayah_phone?: string;
  koordinator_wilayah_email?: string;
  is_active?: boolean;
}
export interface BranchCreateBody {
  code?: string;
  name?: string;
  city?: string;
  region?: string;
  province_id?: string | number;
  kabupaten_id?: string | number;
  manager_name?: string;
  phone?: string;
  email?: string;
  address?: string;
  create_admin_account?: { name: string; email: string; password: string };
}

export interface UserListItem {
  id: string;
  email: string;
  name: string;
  role: string;
  branch_id: string | null;
  region: string | null;
  company_name: string | null;
  is_active: boolean;
  created_at: string;
  Branch?: { id: string; code: string; name: string } | null;
}
export const adminPusatApi = {
  getDashboard: (params?: { branch_id?: string; date_from?: string; date_to?: string; status?: string; provinsi_id?: string; wilayah_id?: string }) =>
    api.get<{ success: boolean; data: AdminPusatDashboardData }>('/admin-pusat/dashboard', { params }),
  getCombinedRecap: (params?: { branch_id?: string; date_from?: string; date_to?: string }) =>
    api.get<{ success: boolean; data: AdminPusatCombinedRecapData }>('/admin-pusat/combined-recap', { params }),
  exportRecapExcel: (params?: { branch_id?: string; date_from?: string; date_to?: string }) =>
    api.get('/admin-pusat/export-recap-excel', { params, responseType: 'blob' }),
  exportRecapPdf: (params?: { branch_id?: string; date_from?: string; date_to?: string }) =>
    api.get('/admin-pusat/export-recap-pdf', { params, responseType: 'blob' }),
  listUsers: (params?: { role?: string; branch_id?: string; is_active?: string; limit?: number; page?: number; sort_by?: string; sort_order?: 'asc' | 'desc' }) =>
    api.get<{ success: boolean; data: UserListItem[]; pagination?: { total: number; page: number; limit: number; totalPages: number } }>('/admin-pusat/users', { params }),
  createUser: (body: { name: string; email: string; password: string; role: string; branch_id?: string; region?: string }) =>
    api.post<{ success: boolean; data: any }>('/admin-pusat/users', body),
  updateUser: (id: string, body: { name?: string; email?: string; password?: string; is_active?: boolean }) =>
    api.patch<{ success: boolean; data: any }>(`/admin-pusat/users/${id}`, body),
  deleteUser: (id: string) => api.delete<{ success: boolean; message?: string }>(`/admin-pusat/users/${id}`),
  setProductAvailability: (productId: string, body: { quantity?: number; meta?: object }) =>
    api.put<{ success: boolean; data: any }>(`/admin-pusat/products/${productId}/availability`, body),
  listFlyers: (params?: { type?: string; product_id?: string; is_published?: string }) =>
    api.get<{ success: boolean; data: FlyerTemplate[] }>('/admin-pusat/flyers', { params }),
  listPublishedFlyers: () => api.get<{ success: boolean; data: FlyerTemplate[] }>('/admin-pusat/flyers/published'),
  createFlyer: (body: { name: string; type: string; product_id?: string; design_content?: string; thumbnail_url?: string }) =>
    api.post<{ success: boolean; data: FlyerTemplate }>('/admin-pusat/flyers', body),
  updateFlyer: (id: string, body: Partial<{ name: string; type: string; product_id: string | null; design_content: string; thumbnail_url: string }>) =>
    api.patch<{ success: boolean; data: FlyerTemplate }>(`/admin-pusat/flyers/${id}`, body),
  deleteFlyer: (id: string) => api.delete<{ success: boolean }>(`/admin-pusat/flyers/${id}`),
  publishFlyer: (id: string) => api.post<{ success: boolean; data: FlyerTemplate }>(`/admin-pusat/flyers/${id}/publish`)
};
export interface AdminPusatDashboardData {
  branches: Branch[];
  orders: {
    total: number;
    by_status: Record<string, number>;
    by_branch: Array<{ branch_id: string; branch_name: string; code: string; count: number; revenue: number }>;
    by_wilayah: Array<{ wilayah_id: string | null; wilayah_name: string; count: number; revenue: number }>;
    by_provinsi: Array<{ provinsi_id: string | null; provinsi_name: string; count: number; revenue: number }>;
    total_revenue: number;
  };
  invoices: { total: number; by_status: Record<string, number> };
  owners_total: number;
  orders_recent: any[];
}
export interface AdminPusatCombinedRecapData {
  recap: {
    total_orders: number;
    total_invoices: number;
    orders_by_branch: Record<string, number>;
    orders_by_status: Record<string, number>;
    items_hotel: number;
    items_visa: number;
    items_ticket: number;
    items_bus: number;
  };
  orders: any[];
  branches: Branch[];
}
export interface FlyerTemplate {
  id: string;
  name: string;
  type: 'product' | 'package';
  product_id: string | null;
  design_content: string | null;
  thumbnail_url: string | null;
  is_published: boolean;
  published_at: string | null;
  created_by: string | null;
  Product?: { id: string; code: string; name: string; type?: string };
  CreatedBy?: { id: string; name: string };
  created_at?: string;
  updated_at?: string;
}

export const accountingApi = {
  getDashboard: (params?: { branch_id?: string; provinsi_id?: string; wilayah_id?: string; date_from?: string; date_to?: string }) =>
    api.get<{ success: boolean; data: AccountingDashboardData }>('/accounting/dashboard', { params }),
  getDashboardKpi: (params?: { branch_id?: string; wilayah_id?: string; date_from?: string; date_to?: string }) =>
    api.get<{ success: boolean; data: AccountingKpiData }>('/accounting/dashboard-kpi', { params }),
  getChartOfAccounts: (params?: { active_only?: string; account_type?: string; level?: number; is_header?: string; parent_id?: string | null; search?: string }) =>
    api.get<{ success: boolean; data: ChartOfAccountItem[] }>('/accounting/chart-of-accounts', { params }),
  getChartOfAccountById: (id: string) =>
    api.get<{ success: boolean; data: ChartOfAccountItem }>(`/accounting/chart-of-accounts/${id}`),
  createChartOfAccount: (body: { code: string; name: string; account_type: string; parent_id?: string | null; is_header?: boolean; currency?: string; sort_order?: number }) =>
    api.post<{ success: boolean; data: ChartOfAccountItem; message: string }>('/accounting/chart-of-accounts', body),
  updateChartOfAccount: (id: string, body: { name?: string; account_type?: string; is_header?: boolean; currency?: string; sort_order?: number; is_active?: boolean }) =>
    api.patch<{ success: boolean; data: ChartOfAccountItem; message: string }>(`/accounting/chart-of-accounts/${id}`, body),
  deleteChartOfAccount: (id: string) =>
    api.delete<{ success: boolean; message: string }>(`/accounting/chart-of-accounts/${id}`),
  getFiscalYears: (params?: { is_closed?: string; search?: string }) =>
    api.get<{ success: boolean; data: FiscalYearItem[] }>('/accounting/fiscal-years', { params }),
  getFiscalYearById: (id: string) =>
    api.get<{ success: boolean; data: FiscalYearItem }>(`/accounting/fiscal-years/${id}`),
  createFiscalYear: (body: { code: string; name: string; start_date: string; end_date: string }) =>
    api.post<{ success: boolean; data: FiscalYearItem; message: string }>('/accounting/fiscal-years', body),
  lockAllPeriods: (id: string) =>
    api.post<{ success: boolean; data: FiscalYearItem; message: string }>(`/accounting/fiscal-years/${id}/lock-all`),
  closeFiscalYear: (id: string) =>
    api.post<{ success: boolean; data: FiscalYearItem; message: string }>(`/accounting/fiscal-years/${id}/close`),
  getAccountingPeriods: (params?: { fiscal_year_id?: string; is_locked?: string }) =>
    api.get<{ success: boolean; data: AccountingPeriodItem[] }>('/accounting/periods', { params }),
  lockPeriod: (id: string) =>
    api.post<{ success: boolean; data: AccountingPeriodItem; message: string }>(`/accounting/periods/${id}/lock`),
  unlockPeriod: (id: string) =>
    api.post<{ success: boolean; data: AccountingPeriodItem; message: string }>(`/accounting/periods/${id}/unlock`),
  getAccountMappings: () =>
    api.get<{ success: boolean; data: AccountMappingItem[] }>('/accounting/account-mappings'),
  listAccountingOwners: (params?: { branch_id?: string; provinsi_id?: string; wilayah_id?: string }) =>
    api.get<{ success: boolean; data: Array<{ id: string; name: string }> }>('/accounting/owners', { params }),
  getAgingReport: (params?: { branch_id?: string; provinsi_id?: string; wilayah_id?: string; owner_id?: string; status?: string; order_status?: string; date_from?: string; date_to?: string; due_from?: string; due_to?: string; search?: string; page?: number; limit?: number; bucket?: string }) =>
    api.get<{ success: boolean; data: AccountingAgingData }>('/accounting/aging', { params }),
  exportAgingExcel: (params?: { branch_id?: string; provinsi_id?: string; wilayah_id?: string; owner_id?: string; status?: string; order_status?: string; date_from?: string; date_to?: string; due_from?: string; due_to?: string; search?: string }) =>
    api.get('/accounting/export-aging-excel', { params, responseType: 'blob' }),
  exportAgingPdf: (params?: { branch_id?: string; provinsi_id?: string; wilayah_id?: string; owner_id?: string; status?: string; order_status?: string; date_from?: string; date_to?: string; due_from?: string; due_to?: string; search?: string }) =>
    api.get('/accounting/export-aging-pdf', { params, responseType: 'blob' }),
  getPaymentsList: (params?: { branch_id?: string; verified?: string; date_from?: string; date_to?: string }) =>
    api.get<{ success: boolean; data: any[] }>('/accounting/payments', { params }),
  listInvoices: (params?: { status?: string; branch_id?: string }) =>
    api.get<{ success: boolean; data: any[] }>('/accounting/invoices', { params }),
  listOrders: (params?: { branch_id?: string; status?: string; limit?: number }) =>
    api.get<{ success: boolean; data: any[] }>('/accounting/orders', { params }),
  getFinancialReport: (params?: { period?: string; year?: string; month?: string; date_from?: string; date_to?: string; branch_id?: string; provinsi_id?: string; wilayah_id?: string; owner_id?: string; status?: string; order_status?: string; product_type?: string; search?: string; min_amount?: number; max_amount?: number; page?: number; limit?: number; sort_by?: string; sort_order?: 'asc' | 'desc' }) =>
    api.get<{ success: boolean; data: AccountingFinancialReportData }>('/accounting/financial-report', { params }),
  exportFinancialExcel: (params?: { period?: string; year?: string; month?: string; date_from?: string; date_to?: string; branch_id?: string; provinsi_id?: string; wilayah_id?: string; owner_id?: string; status?: string; order_status?: string; product_type?: string; search?: string; min_amount?: number; max_amount?: number }) =>
    api.get('/accounting/export-financial-excel', { params, responseType: 'blob' }),
  exportFinancialPdf: (params?: { period?: string; year?: string; month?: string; date_from?: string; date_to?: string; branch_id?: string; provinsi_id?: string; wilayah_id?: string; owner_id?: string; status?: string; order_status?: string; product_type?: string; search?: string; min_amount?: number; max_amount?: number }) =>
    api.get('/accounting/export-financial-pdf', { params, responseType: 'blob' }),
  getReconciliation: (params?: { reconciled?: string; date_from?: string; date_to?: string; branch_id?: string }) =>
    api.get<{ success: boolean; data: any[] }>('/accounting/reconciliation', { params }),
  reconcilePayment: (id: string) =>
    api.post<{ success: boolean; data: any }>(`/accounting/payments/${id}/reconcile`),
  payroll: {
    getSettings: (params?: { branch_id?: string }) => api.get<{ success: boolean; data: PayrollSettingData }>('/accounting/payroll/settings', { params }),
    updateSettings: (body: { branch_id?: string; method?: string; payroll_day_of_month?: number; run_time?: string; is_active?: boolean; company_name_slip?: string; company_address_slip?: string }) =>
      api.put<{ success: boolean; data: PayrollSettingData; message: string }>('/accounting/payroll/settings', body),
    listEmployees: (params?: { branch_id?: string }) => api.get<{ success: boolean; data: PayrollEmployeeItem[] }>('/accounting/payroll/employees', { params }),
    getEmployeeSalary: (userId: string) => api.get<{ success: boolean; data: EmployeeSalaryData }>(`/accounting/payroll/employees/${userId}/salary`),
    upsertEmployeeSalary: (userId: string, body: { base_salary: number; allowances?: { name: string; amount: number }[]; deductions?: { name: string; amount: number }[]; effective_from?: string; effective_to?: string; notes?: string }) =>
      api.put<{ success: boolean; data: EmployeeSalaryData; message: string }>(`/accounting/payroll/employees/${userId}/salary`, body),
    listRuns: (params?: { branch_id?: string; period_year?: number; period_month?: number; status?: string; page?: number; limit?: number }) =>
      api.get<{ success: boolean; data: PayrollRunData[]; pagination: { total: number; page: number; limit: number; totalPages: number } }>('/accounting/payroll/runs', { params }),
    createRun: (body: { period_month: number; period_year: number; method?: string; branch_id?: string }) =>
      api.post<{ success: boolean; data: PayrollRunData; message: string }>('/accounting/payroll/runs', body),
    getRun: (id: string) => api.get<{ success: boolean; data: PayrollRunData }>(`/accounting/payroll/runs/${id}`),
    updateRun: (id: string, body: { items?: { id: string; base_salary?: number; allowances?: { name: string; amount: number }[]; deductions?: { name: string; amount: number }[]; notes?: string }[] }) =>
      api.patch<{ success: boolean; data: PayrollRunData; message: string }>(`/accounting/payroll/runs/${id}`, body),
    finalizeRun: (id: string) => api.post<{ success: boolean; data: PayrollRunData; message: string }>(`/accounting/payroll/runs/${id}/finalize`),
    getSlipPdf: (runId: string, itemId: string) => api.get(`/accounting/payroll/runs/${runId}/items/${itemId}/slip`, { responseType: 'blob' }),
    getMySlips: () => api.get<{ success: boolean; data: MySlipItem[] }>('/accounting/payroll/my-slips'),
    getMySlipPdf: (itemId: string) => api.get(`/accounting/payroll/my-slips/${itemId}/slip`, { responseType: 'blob' })
  }
};
export interface PayrollSettingData {
  id: string;
  branch_id?: string;
  method: string;
  payroll_day_of_month?: number;
  run_time?: string;
  is_active: boolean;
  company_name_slip?: string;
  company_address_slip?: string;
  Branch?: { id: string; code: string; name: string };
}
export interface EmployeeSalaryData {
  id: string;
  user_id: string;
  base_salary: number;
  allowances: { name?: string; amount?: number }[];
  deductions: { name?: string; amount?: number }[];
  effective_from?: string;
  effective_to?: string;
  notes?: string;
}
export interface PayrollEmployeeItem {
  id: string;
  name: string;
  email: string;
  role: string;
  branch_id?: string;
  Branch?: { id: string; code: string; name: string };
  salary_template?: EmployeeSalaryData | null;
}
export interface PayrollItemData {
  id: string;
  user_id: string;
  base_salary: number;
  allowances: { name?: string; amount?: number }[];
  deductions: { name?: string; amount?: number }[];
  gross: number;
  total_deductions: number;
  net: number;
  slip_file_path?: string;
  slip_generated_at?: string;
  notes?: string;
  User?: { id: string; name: string; email?: string; role?: string };
}
export interface PayrollRunData {
  id: string;
  period_month: number;
  period_year: number;
  status: string;
  method: string;
  branch_id?: string;
  total_amount: number;
  created_by?: string;
  processed_at?: string;
  finalized_at?: string;
  Branch?: { id: string; code: string; name: string };
  CreatedBy?: { id: string; name: string };
  PayrollItems?: PayrollItemData[];
}
export interface MySlipItem {
  id: string;
  payroll_run_id: string;
  period_month: number;
  period_year: number;
  net: number;
  slip_generated_at: string;
}
export interface AccountingFinancialReportData {
  period: { start: string; end: string };
  total_revenue: number;
  by_branch: Array<{ branch_id: string; branch_name: string; revenue: number; invoice_count?: number }>;
  by_wilayah?: Array<{ wilayah_id: string; wilayah_name: string; revenue: number; invoice_count?: number }>;
  by_provinsi?: Array<{ provinsi_id: string; provinsi_name: string; revenue: number; invoice_count?: number }>;
  by_owner: Array<{ owner_id: string; owner_name: string; revenue: number; invoice_count?: number }>;
  by_product_type: Array<{ type: string; revenue: number }>;
  by_period?: Array<{ period: string; revenue: number; invoice_count?: number }>;
  invoice_count: number;
  invoices: Array<{
    id: string;
    invoice_number: string;
    order_number?: string;
    owner_name?: string;
    branch_name?: string;
    total_amount: number;
    paid_amount: number;
    remaining_amount: number;
    status: string;
    order_status?: string;
    issued_at?: string;
  }>;
  pagination?: { total: number; page: number; limit: number; totalPages: number };
  previous_period?: {
    start: string;
    end: string;
    revenue: number;
    invoice_count: number;
    growth_percent: string | null;
  };
}
export interface AccountingDashboardData {
  branches: { id: string; code: string; name: string; Provinsi?: { id: string; name: string; Wilayah?: { id: string; name: string } } }[];
  summary: {
    total_invoices: number;
    total_receivable: number;
    total_paid: number;
    by_status: Record<string, number>;
    by_branch: Array<{ branch_id: string; branch_name: string; code: string; count: number; receivable: number; paid: number }>;
    by_provinsi?: Array<{ provinsi_id: string; provinsi_name: string; count: number; receivable: number; paid: number }>;
    by_wilayah?: Array<{ wilayah_id: string; wilayah_name: string; count: number; receivable: number; paid: number }>;
  };
  invoices_recent: any[];
}
export interface AccountingKpiData {
  total_revenue: number;
  total_receivable: number;
  by_wilayah: Array<{ wilayah_id: string; name: string; revenue: number; receivable: number }>;
  by_product: Record<string, number>;
  branches: { id: string; code: string; name: string }[];
}
export interface ChartOfAccountItem {
  id: string;
  parent_id?: string | null;
  code: string;
  name: string;
  account_type: string;
  level: number;
  is_header: boolean;
  currency: string;
  is_active: boolean;
  sort_order?: number;
  Parent?: { id: string; code: string; name: string };
  Children?: ChartOfAccountItem[];
}
export interface FiscalYearItem {
  id: string;
  code: string;
  name: string;
  start_date: string;
  end_date: string;
  is_closed: boolean;
  closed_at?: string | null;
  closed_by?: string | null;
  Periods?: AccountingPeriodItem[];
}
export interface AccountingPeriodItem {
  id: string;
  fiscal_year_id: string;
  period_number: number;
  start_date: string;
  end_date: string;
  is_locked: boolean;
  locked_at?: string | null;
  locked_by?: string | null;
  FiscalYear?: { id: string; code: string; name: string; is_closed?: boolean };
}
export interface AccountMappingItem {
  id: string;
  mapping_type: string;
  DebitAccount?: { id: string; code: string; name: string };
  CreditAccount?: { id: string; code: string; name: string };
}
export interface AccountingAgingData {
  buckets: { current: any[]; days_1_30: any[]; days_31_60: any[]; days_61_plus: any[] };
  bucket_counts?: { current: number; days_1_30: number; days_31_60: number; days_61_plus: number };
  items?: any[];
  pagination?: { total: number; page: number; limit: number; totalPages: number };
  totals: { current: number; days_1_30: number; days_31_60: number; days_61_plus: number };
  total_outstanding: number;
}

export type ReportType = 'revenue' | 'orders' | 'partners' | 'jamaah' | 'financial' | 'logs';
export type ReportGroupBy = 'day' | 'week' | 'month' | 'quarter' | 'year';
export type ReportPeriod = 'today' | 'week' | 'month' | 'quarter' | 'year' | 'all';

export interface ReportsFiltersData {
  branches: { id: string; code: string; name: string; provinsi_id?: string | null }[];
  wilayah: { id: string; name: string }[];
  provinsi: { id: string; name: string; kode?: string; wilayah_id?: string; Wilayah?: { id: string; name: string } }[];
}

export interface ReportsAnalyticsData {
  report_type: string;
  period?: { start: string; end: string } | null;
  summary: Record<string, number>;
  series: Array<{ period: string; count?: number; revenue?: number; jamaah?: number }>;
  breakdown: {
    by_status?: Record<string, number>;
    by_branch?: Array<{ branch_id: string; branch_name?: string; code?: string; count?: number; revenue?: number; invoice_count?: number; jamaah?: number }>;
    by_wilayah?: Array<{ wilayah_id: string; wilayah_name?: string; count?: number; revenue?: number; invoice_count?: number }>;
    by_provinsi?: Array<{ provinsi_id: string; provinsi_name?: string; count?: number; revenue?: number; invoice_count?: number }>;
    by_owner?: Array<{ owner_id: string; owner_name?: string; count?: number; revenue?: number; invoice_count?: number }>;
    by_role?: Record<string, number>;
    by_source?: Record<string, number>;
    by_level?: Record<string, number>;
  };
  rows: any[];
  pagination: { page: number; limit: number; total: number; totalPages: number };
}

export const reportsApi = {
  getFilters: () =>
    api.get<{ success: boolean; data: ReportsFiltersData }>('/reports/filters'),
  getAnalytics: (params?: {
    report_type?: ReportType;
    date_from?: string;
    date_to?: string;
    period?: ReportPeriod;
    branch_id?: string;
    wilayah_id?: string;
    provinsi_id?: string;
    group_by?: ReportGroupBy;
    role?: string;
    page?: number;
    limit?: number;
    source?: string;
    level?: string;
  }) =>
    api.get<{ success: boolean; data: ReportsAnalyticsData }>('/reports/analytics', { params }),
  exportExcel: (params?: {
    report_type?: ReportType;
    date_from?: string;
    date_to?: string;
    period?: ReportPeriod;
    branch_id?: string;
    wilayah_id?: string;
    provinsi_id?: string;
    role?: string;
    source?: string;
    level?: string;
  }) =>
    api.get('/reports/export-excel', { params, responseType: 'blob' }),
  exportPdf: (params?: {
    report_type?: ReportType;
    date_from?: string;
    date_to?: string;
    period?: ReportPeriod;
    branch_id?: string;
    wilayah_id?: string;
    provinsi_id?: string;
    role?: string;
    source?: string;
    level?: string;
  }) =>
    api.get('/reports/export-pdf', { params, responseType: 'blob' })
};

export const adminCabangApi = {
  getDashboard: () => api.get<{ success: boolean; data: AdminCabangDashboardData }>('/admin-cabang/dashboard'),
  listOrders: (params?: { status?: string }) => api.get<{ success: boolean; data: any[] }>('/admin-cabang/orders', { params }),
  createUser: (body: { name: string; email: string; password: string; role: string }) => api.post('/admin-cabang/users', body),
  sendOrderResult: (orderId: string, channel?: 'email' | 'whatsapp' | 'both') => api.post(`/admin-cabang/orders/${orderId}/send-result`, { channel })
};

export const koordinatorApi = {
  getDashboard: () => api.get<{ success: boolean; data: AdminCabangDashboardData }>('/koordinator/dashboard'),
  listOrders: (params?: { status?: string }) => api.get<{ success: boolean; data: any[] }>('/koordinator/orders', { params }),
  sendOrderResult: (orderId: string, channel?: 'email' | 'whatsapp' | 'both') => api.post(`/koordinator/orders/${orderId}/send-result`, { channel })
};

export const ownersApi = {
  register: (body: { email: string; password: string; name: string; phone?: string; company_name?: string; address?: string; operational_region?: string; preferred_branch_id?: string; whatsapp?: string; npwp?: string }) =>
    api.post<{ success: boolean; message?: string; data?: { user: any; owner_status: string } }>('/owners/register', body),
  list: (params?: { status?: string; branch_id?: string }) => api.get<{ success: boolean; data: OwnerProfile[] }>('/owners', { params }),
  assignBranch: (ownerId: string, branchId: string) => api.patch(`/owners/${ownerId}/assign-branch`, { branch_id: branchId }),
  verifyDeposit: (ownerId: string) => api.patch(`/owners/${ownerId}/verify-deposit`),
  activate: (ownerId: string) => api.patch(`/owners/${ownerId}/activate`)
};

interface AdminCabangDashboardData {
  orders: { total: number; by_status: Record<string, number> };
  orders_recent: any[];
  owners: { total: number; list: any[] };
  recap_invoice: { total: number; by_status: Record<string, number> };
  recap_hotel: { total: number; by_status: Record<string, number> };
  recap_visa: { total: number; by_status: Record<string, number> };
  recap_ticket: { total: number; by_status: Record<string, number> };
  recap_bus: { total: number; by_status?: Record<string, number> };
}
interface OwnerProfile {
  id: string;
  user_id: string;
  status: string;
  assigned_branch_id?: string;
  User?: { id: string; name: string; email: string; company_name?: string };
  AssignedBranch?: { id: string; code: string; name: string };
}

export default api;
