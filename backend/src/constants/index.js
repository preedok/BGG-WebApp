/**
 * BINTANG GLOBAL - Constants
 * Sesuai Master Business Process
 */

const ROLES = {
  SUPER_ADMIN: 'super_admin',
  ADMIN_PUSAT: 'admin_pusat',
  ADMIN_CABANG: 'admin_cabang',
  ROLE_INVOICE: 'role_invoice',
  ROLE_HOTEL: 'role_hotel',
  ROLE_VISA: 'role_visa',
  ROLE_TICKET: 'role_ticket',
  ROLE_BUS: 'role_bus',
  ROLE_HANDLING: 'role_handling',
  ROLE_ACCOUNTING: 'role_accounting',
  OWNER: 'owner'
};

// PROSES A - Registrasi & Aktivasi Owner
const OWNER_STATUS = {
  REGISTERED_PENDING_MOU: 'registered_pending_mou',
  PENDING_MOU_APPROVAL: 'pending_mou_approval',
  PENDING_DEPOSIT_PAYMENT: 'pending_deposit_payment',
  PENDING_DEPOSIT_VERIFICATION: 'pending_deposit_verification',
  DEPOSIT_VERIFIED: 'deposit_verified',
  ASSIGNED_TO_BRANCH: 'assigned_to_branch',
  ACTIVE: 'active',
  REJECTED: 'rejected'
};

// IV. Status Invoice (Blueprint)
const INVOICE_STATUS = {
  DRAFT: 'draft',
  TENTATIVE: 'tentative',
  PARTIAL_PAID: 'partial_paid',
  PAID: 'paid',
  PROCESSING: 'processing',
  COMPLETED: 'completed',
  OVERDUE: 'overdue',
  CANCELED: 'canceled',
  REFUNDED: 'refunded'
};

// VII. Status Refund
const REFUND_STATUS = {
  REQUESTED: 'requested',
  APPROVED: 'approved',
  REJECTED: 'rejected',
  REFUNDED: 'refunded'
};

// VI. Hotel progress (Role Hotel)
const HOTEL_PROGRESS_STATUS = {
  WAITING_CONFIRMATION: 'waiting_confirmation',
  CONFIRMED: 'confirmed',
  ROOM_ASSIGNED: 'room_assigned',
  COMPLETED: 'completed'
};

const ROOM_STATUS = {
  AVAILABLE: 'available',
  BOOKED: 'booked',
  OCCUPIED: 'occupied'
};

// VI. Visa progress (Role Visa)
const VISA_PROGRESS_STATUS = {
  DOCUMENT_RECEIVED: 'document_received',
  SUBMITTED: 'submitted',
  IN_PROCESS: 'in_process',
  APPROVED: 'approved',
  ISSUED: 'issued'
};

// VI. Bus progress (Role Bus Saudi) - tiket bis, kedatangan, keberangkatan, kepulangan
const BUS_TICKET_STATUS = {
  PENDING: 'pending',
  ISSUED: 'issued'
};
const BUS_TRIP_STATUS = {
  PENDING: 'pending',
  SCHEDULED: 'scheduled',
  COMPLETED: 'completed'
};

// VI. Ticket progress (Role Tiket)
const TICKET_PROGRESS_STATUS = {
  PENDING: 'pending',
  DATA_RECEIVED: 'data_received',
  SEAT_RESERVED: 'seat_reserved',
  BOOKING: 'booking',
  PAYMENT_AIRLINE: 'payment_airline',
  TICKET_ISSUED: 'ticket_issued'
};

// Order item types
const ORDER_ITEM_TYPE = {
  HOTEL: 'hotel',
  VISA: 'visa',
  TICKET: 'ticket',
  BUS: 'bus',
  HANDLING: 'handling',
  PACKAGE: 'package'
};

// Room types for hotel
const ROOM_TYPES = ['single', 'double', 'quad', 'quint'];

// Order status (add blocked)
const ORDER_STATUS = {
  DRAFT: 'draft',
  TENTATIVE: 'tentative',
  CONFIRMED: 'confirmed',
  PROCESSING: 'processing',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled',
  BLOCKED: 'blocked'
};

// Business rule keys (configurable by pusat / cabang)
const BUSINESS_RULE_KEYS = {
  BUS_MIN_PACK: 'bus_min_pack',
  BUS_PENALTY_IDR: 'bus_penalty_idr',
  HANDLING_DEFAULT_SAR: 'handling_default_sar',
  REQUIRE_HOTEL_WITH_VISA: 'require_hotel_with_visa',
  DP_GRACE_HOURS: 'dp_grace_hours',
  DP_DUE_DAYS: 'dp_due_days',
  CURRENCY_RATES: 'currency_rates',
  REGISTRATION_DEPOSIT_IDR: 'registration_deposit_idr'
};

// Notifikasi trigger (VIII)
const NOTIFICATION_TRIGGER = {
  INVOICE_CREATED: 'invoice_created',
  DP_RECEIVED: 'dp_received',
  OVERDUE: 'overdue',
  LUNAS: 'lunas',
  HOTEL_CONFIRMED: 'hotel_confirmed',
  VISA_ISSUED: 'visa_issued',
  TICKET_ISSUED: 'ticket_issued',
  ORDER_COMPLETED: 'order_completed',
  CANCEL: 'cancel',
  REFUND: 'refund'
};

// Business rules
const BUSINESS_RULES = {
  DP_PERCENTAGE_NORMAL: 30,
  DP_PERCENTAGE_SUPER_PROMO: 50,
  DP_GRACE_HOURS: 24,        // Invoice tentative batal jika belum DP dalam 24 jam
  DP_DUE_DAYS: 3,            // Tenggat DP 3 hari
  BUS_MIN_PACK: 35,
  CURRENCY: ['IDR', 'SAR'],
  REGISTRATION_DEPOSIT_IDR: 25000000  // Biaya pendaftaran owner (umum dari pusat, bisa diubah cabang)
};

module.exports = {
  ROLES,
  OWNER_STATUS,
  INVOICE_STATUS,
  REFUND_STATUS,
  HOTEL_PROGRESS_STATUS,
  ROOM_STATUS,
  BUS_TICKET_STATUS,
  BUS_TRIP_STATUS,
  VISA_PROGRESS_STATUS,
  TICKET_PROGRESS_STATUS,
  ORDER_ITEM_TYPE,
  ORDER_STATUS,
  ROOM_TYPES,
  BUSINESS_RULE_KEYS,
  NOTIFICATION_TRIGGER,
  BUSINESS_RULES
};
