const asyncHandler = require('express-async-handler');
const { Op } = require('sequelize');
const {
  Order,
  OrderItem,
  User,
  Branch,
  OwnerProfile,
  Invoice,
  HotelProgress,
  VisaProgress,
  TicketProgress,
  BusProgress,
  Notification
} = require('../models');
const { ROLES, ORDER_ITEM_TYPE, NOTIFICATION_TRIGGER } = require('../constants');

/**
 * GET /api/v1/admin-cabang/dashboard
 * Rekapitulasi lengkap cabang: order, owner, pekerjaan per role (invoice, hotel, visa, ticket, bus).
 */
const getDashboard = asyncHandler(async (req, res) => {
  const branchId = req.user.branch_id;
  if (!branchId) return res.status(403).json({ success: false, message: 'Admin cabang harus terikat cabang' });

  const [
    orderCounts,
    ordersRecent,
    ownersInBranch,
    invoiceStats,
    hotelStats,
    visaStats,
    ticketStats,
    busStats
  ] = await Promise.all([
    Order.findAndCountAll({
      where: { branch_id: branchId },
      attributes: ['status'],
      raw: true
    }).then(r => {
      const byStatus = {};
      (r.rows || []).forEach(o => { byStatus[o.status] = (byStatus[o.status] || 0) + 1; });
      return { total: r.count, by_status: byStatus };
    }),
    Order.findAll({
      where: { branch_id: branchId },
      include: [{ model: User, as: 'User', attributes: ['id', 'name', 'company_name'] }],
      order: [['created_at', 'DESC']],
      limit: 10
    }),
    OwnerProfile.findAndCountAll({
      where: { assigned_branch_id: branchId },
      include: [{ model: User, as: 'User', attributes: ['id', 'name', 'email', 'company_name'] }]
    }).then(r => ({ total: r.count, list: r.rows })),
    Invoice.findAll({
      where: { branch_id: branchId },
      attributes: ['id', 'status'],
      raw: true
    }).then(rows => {
      const byStatus = {};
      rows.forEach(i => { byStatus[i.status] = (byStatus[i.status] || 0) + 1; });
      return { total: rows.length, by_status: byStatus };
    }),
    getRoleRecap(branchId, ORDER_ITEM_TYPE.HOTEL, HotelProgress, 'status'),
    getRoleRecap(branchId, ORDER_ITEM_TYPE.VISA, VisaProgress, 'status'),
    getRoleRecap(branchId, ORDER_ITEM_TYPE.TICKET, TicketProgress, 'status'),
    getRoleRecap(branchId, ORDER_ITEM_TYPE.BUS, BusProgress, null)
  ]);

  const busRecap = busStats || { total: 0, ticket_pending: 0, ticket_issued: 0, trip_pending: 0 };

  res.json({
    success: true,
    data: {
      orders: orderCounts,
      orders_recent: ordersRecent,
      owners: { total: ownersInBranch.total, list: ownersInBranch.list },
      recap_invoice: invoiceStats,
      recap_hotel: hotelStats,
      recap_visa: visaStats,
      recap_ticket: ticketStats,
      recap_bus: busRecap
    }
  });
});

async function getRoleRecap(branchId, itemType, ProgressModel, statusField) {
  const asName = ProgressModel.name;
  const orderIds = await OrderItem.findAll({
    where: { type: itemType },
    attributes: ['order_id'],
    raw: true
  }).then(rows => [...new Set(rows.map(r => r.order_id))]);

  const orders = await Order.findAll({
    where: { id: orderIds, branch_id: branchId },
    include: [{
      model: OrderItem,
      as: 'OrderItems',
      where: { type: itemType },
      required: true,
      include: [{ model: ProgressModel, as: asName, required: false }]
    }]
  });

  let total = 0;
  const byStatus = {};
  orders.forEach(o => {
    (o.OrderItems || []).forEach(item => {
      total += 1;
      const prog = item[asName];
      if (asName === 'BusProgress' && prog) {
        byStatus.bus_ticket_pending = (byStatus.bus_ticket_pending || 0) + (prog.bus_ticket_status === 'pending' ? 1 : 0);
        byStatus.bus_ticket_issued = (byStatus.bus_ticket_issued || 0) + (prog.bus_ticket_status === 'issued' ? 1 : 0);
      } else if (statusField && prog) {
        const s = prog[statusField] || 'pending';
        byStatus[s] = (byStatus[s] || 0) + 1;
      }
    });
  });

  return { total, by_status: byStatus };
}

/**
 * POST /api/v1/admin-cabang/users
 * Buat akun baru untuk role di cabang (personil: role_hotel, role_visa, role_ticket, role_bus, role_accounting).
 */
const createUser = asyncHandler(async (req, res) => {
  const branchId = req.user.branch_id;
  if (!branchId) return res.status(403).json({ success: false, message: 'Admin cabang harus terikat cabang' });

  const { name, email, password, role } = req.body;
  const allowedRoles = [ROLES.ROLE_HOTEL, ROLES.ROLE_VISA, ROLES.ROLE_TICKET, ROLES.ROLE_BUS, ROLES.ROLE_ACCOUNTING];
  if (!name || !email || !password || !role) {
    return res.status(400).json({ success: false, message: 'name, email, password, role wajib' });
  }
  if (!allowedRoles.includes(role)) {
    return res.status(400).json({ success: false, message: 'Role tidak valid untuk personil cabang' });
  }

  const existing = await User.findOne({ where: { email: email.toLowerCase() } });
  if (existing) return res.status(400).json({ success: false, message: 'Email sudah terdaftar' });

  const user = await User.create({
    email: email.toLowerCase(),
    password_hash: password,
    name,
    role,
    branch_id: branchId,
    is_active: true
  });

  const u = user.toJSON();
  delete u.password_hash;
  res.status(201).json({ success: true, message: 'Akun personil berhasil dibuat', data: u });
});

/**
 * POST /api/v1/admin-cabang/orders/:id/send-result
 * Kirim hasil order ke owner (notifikasi in-app + optional email/wa). Admin cabang trigger ketika semua pekerjaan selesai.
 */
const sendOrderResult = asyncHandler(async (req, res) => {
  const branchId = req.user.branch_id;
  const { id: orderId } = req.params;
  const { channel } = req.body; // 'email' | 'whatsapp' | 'both' | null (in-app only)

  const order = await Order.findByPk(orderId, {
    include: [{ model: User, as: 'User', attributes: ['id', 'name', 'email'] }]
  });
  if (!order) return res.status(404).json({ success: false, message: 'Order tidak ditemukan' });
  if (order.branch_id !== branchId) return res.status(403).json({ success: false, message: 'Bukan order cabang Anda' });

  const title = 'Order selesai';
  const message = `Order ${order.order_number} telah selesai. Hasil order dapat diunduh/dilihat di aplikasi.`;
  const data = { order_id: order.id, order_number: order.order_number };

  await Notification.create({
    user_id: order.owner_id,
    trigger: NOTIFICATION_TRIGGER.ORDER_COMPLETED,
    title,
    message,
    data,
    channel_in_app: true,
    channel_email: channel === 'email' || channel === 'both',
    channel_whatsapp: channel === 'whatsapp' || channel === 'both'
  });

  res.json({
    success: true,
    message: 'Notifikasi telah dikirim ke owner. Email/WhatsApp akan diproses oleh sistem.',
    data: { order_id: order.id }
  });
});

/**
 * GET /api/v1/admin-cabang/orders
 * Daftar order cabang untuk laporan (rekapitulasi orderan).
 */
const listOrders = asyncHandler(async (req, res) => {
  const branchId = req.user.branch_id;
  if (!branchId) return res.status(403).json({ success: false, message: 'Admin cabang harus terikat cabang' });

  const { status } = req.query;
  const where = { branch_id: branchId };
  if (status) where.status = status;

  const orders = await Order.findAll({
    where,
    include: [
      { model: User, as: 'User', attributes: ['id', 'name', 'email', 'company_name'] },
      { model: Branch, as: 'Branch', attributes: ['id', 'code', 'name'] }
    ],
    order: [['created_at', 'DESC']]
  });

  res.json({ success: true, data: orders });
});

module.exports = {
  getDashboard,
  createUser,
  sendOrderResult,
  listOrders
};
