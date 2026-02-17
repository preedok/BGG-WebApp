const ROLES = {
  SUPER_ADMIN: 'super_admin',
  ADMIN_PUSAT: 'admin_pusat',
  ADMIN_KOORDINATOR: 'admin_koordinator',
  INVOICE_KOORDINATOR: 'invoice_koordinator',
  TIKET_KOORDINATOR: 'tiket_koordinator',
  VISA_KOORDINATOR: 'visa_koordinator',
  ROLE_HOTEL: 'role_hotel',
  ROLE_BUS: 'role_bus',
  ROLE_INVOICE_SAUDI: 'role_invoice_saudi',
  ROLE_ACCOUNTING: 'role_accounting',
  OWNER: 'owner'
};

const PERMISSIONS = {
  [ROLES.SUPER_ADMIN]: ['*'],
  [ROLES.ADMIN_PUSAT]: [
    'manage_branches', 'manage_users', 'manage_products',
    'manage_packages', 'manage_settings', 'view_all_reports'
  ],
  [ROLES.ADMIN_KOORDINATOR]: [
    'manage_wilayah', 'view_wilayah_reports', 'manage_owners_wilayah'
  ],
  [ROLES.INVOICE_KOORDINATOR]: [
    'create_orders', 'view_orders', 'manage_invoices'
  ],
  [ROLES.TIKET_KOORDINATOR]: [
    'view_ticket_orders', 'manage_tickets'
  ],
  [ROLES.VISA_KOORDINATOR]: [
    'view_visa_orders', 'process_visa'
  ],
  [ROLES.ROLE_HOTEL]: [
    'view_hotels', 'manage_room_allocation', 'manage_jamaah_handling'
  ],
  [ROLES.ROLE_BUS]: [
    'view_bus_orders', 'manage_bus_allocation'
  ],
  [ROLES.ROLE_INVOICE_SAUDI]: [
    'manage_invoices_saudi'
  ],
  [ROLES.ROLE_ACCOUNTING]: [
    'view_financial_reports', 'manage_payments'
  ],
  [ROLES.OWNER]: [
    'view_products', 'create_orders', 'view_own_orders'
  ]
};

module.exports = { ROLES, PERMISSIONS };
