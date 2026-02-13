const ROLES = {
  SUPER_ADMIN: 'super_admin',
  ADMIN_PUSAT: 'admin_pusat',
  ADMIN_CABANG: 'admin_cabang',
  ROLE_INVOICE: 'role_invoice',
  ROLE_HANDLING: 'role_handling',
  ROLE_VISA: 'role_visa',
  ROLE_BUS: 'role_bus',
  ROLE_TICKET: 'role_ticket',
  ROLE_ACCOUNTING: 'role_accounting',
  OWNER: 'owner'
};

const PERMISSIONS = {
  [ROLES.SUPER_ADMIN]: ['*'],
  [ROLES.ADMIN_PUSAT]: [
    'manage_branches', 'manage_users', 'manage_products',
    'manage_packages', 'manage_settings', 'view_all_reports'
  ],
  [ROLES.ADMIN_CABANG]: [
    'manage_branch_users', 'view_branch_reports', 'manage_owners'
  ],
  [ROLES.ROLE_INVOICE]: [
    'create_orders', 'view_orders', 'manage_invoices'
  ],
  [ROLES.ROLE_HANDLING]: [
    'view_hotels', 'manage_room_allocation'
  ],
  [ROLES.ROLE_VISA]: [
    'view_visa_orders', 'process_visa'
  ],
  [ROLES.ROLE_BUS]: [
    'view_bus_orders', 'manage_bus_allocation'
  ],
  [ROLES.ROLE_TICKET]: [
    'view_ticket_orders', 'manage_tickets'
  ],
  [ROLES.ROLE_ACCOUNTING]: [
    'view_financial_reports', 'manage_payments'
  ],
  [ROLES.OWNER]: [
    'view_products', 'create_orders', 'view_own_orders'
  ]
};

module.exports = { ROLES, PERMISSIONS };
