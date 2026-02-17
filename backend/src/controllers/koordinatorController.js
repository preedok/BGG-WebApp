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
const { getBranchIdsForWilayah } = require('../utils/wilayahScope');

/**
 * GET /api/v1/koordinator/dashboard
 * Rekapitulasi wilayah: order, owner, invoice, hotel, visa, ticket, bus (semua cabang di wilayah).
 */
const getDashboard = asyncHandler(async (req, res) => {
  const wilayahId = req.user.wilayah_id;
  if (!wilayahId) return res.status(403).json({ success: false, message: 'Koordinator harus terikat wilayah' });

  const branchIds = await getBranchIdsForWilayah(wilayahId);
  if (branchIds.length === 0) {
    return res.json({
      success: true,
      data: {
        orders: { total: 0, by_status: {} },
        orders_recent: [],
        owners: { total: 0, list: [] },
        recap_invoice: { total: 0, by_status: {} },
        recap_hotel: { total: 0, by_status: {} },
        recap_visa: { total: 0, by_status: {} },
        recap_ticket: { total: 0, by_status: {} },
        recap_bus: { total: 0, ticket_pending: 0, ticket_issued: 0, trip_pending: 0 }
      }
    });
  }

  const [
    orderCounts,
    ordersRecent,
    ownersInWilayah,
    invoiceStats,
    hotelStats,
    visaStats,
    ticketStats,
    busStats
  ] = await Promise.all([
    Order.findAndCountAll({
      where: { branch_id: { [Op.in]: branchIds } },
      attributes: ['status'],
      raw: true
    }).then(r => {
      const byStatus = {};
      (r.rows || []).forEach(o => { byStatus[o.status] = (byStatus[o.status] || 0) + 1; });
      return { total: r.count, by_status: byStatus };
    }),
    Order.findAll({
      where: { branch_id: { [Op.in]: branchIds } },
      include: [{ model: User, as: 'User', attributes: ['id', 'name', 'company_name'] }],
      order: [['created_at', 'DESC']],
      limit: 10
    }),
    OwnerProfile.findAndCountAll({
      where: { assigned_branch_id: { [Op.in]: branchIds } },
      include: [{ model: User, as: 'User', attributes: ['id', 'name', 'email', 'company_name'] }]
    }).then(r => ({ total: r.count, list: r.rows })),
    Invoice.findAll({
      where: { branch_id: { [Op.in]: branchIds } },
      attributes: ['id', 'status'],
      raw: true
    }).then(rows => {
      const byStatus = {};
      rows.forEach(i => { byStatus[i.status] = (byStatus[i.status] || 0) + 1; });
      return { total: rows.length, by_status: byStatus };
    }),
    getRoleRecap(branchIds, ORDER_ITEM_TYPE.HOTEL, HotelProgress, 'status'),
    getRoleRecap(branchIds, ORDER_ITEM_TYPE.VISA, VisaProgress, 'status'),
    getRoleRecap(branchIds, ORDER_ITEM_TYPE.TICKET, TicketProgress, 'status'),
    getRoleRecap(branchIds, ORDER_ITEM_TYPE.BUS, BusProgress, null)
  ]);

  const busRecap = busStats || { total: 0, ticket_pending: 0, ticket_issued: 0, trip_pending: 0 };

  res.json({
    success: true,
    data: {
      orders: orderCounts,
      orders_recent: ordersRecent,
      owners: { total: ownersInWilayah.total, list: ownersInWilayah.list },
      recap_invoice: invoiceStats,
      recap_hotel: hotelStats,
      recap_visa: visaStats,
      recap_ticket: ticketStats,
      recap_bus: busRecap
    }
  });
});

async function getRoleRecap(branchIds, itemType, ProgressModel, statusField) {
  const asName = ProgressModel.name;
  const orderIds = await OrderItem.findAll({
    where: { type: itemType },
    attributes: ['order_id'],
    raw: true
  }).then(rows => [...new Set(rows.map(r => r.order_id))]);

  const orders = await Order.findAll({
    where: { id: orderIds, branch_id: { [Op.in]: branchIds } },
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
 * GET /api/v1/koordinator/orders
 * Daftar order wilayah (semua cabang di wilayah).
 */
const listOrders = asyncHandler(async (req, res) => {
  const wilayahId = req.user.wilayah_id;
  if (!wilayahId) return res.status(403).json({ success: false, message: 'Koordinator harus terikat wilayah' });

  const branchIds = await getBranchIdsForWilayah(wilayahId);
  if (branchIds.length === 0) return res.json({ success: true, data: [] });

  const { status } = req.query;
  const where = { branch_id: { [Op.in]: branchIds } };
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

/**
 * POST /api/v1/koordinator/orders/:id/send-result
 * Kirim notifikasi hasil order ke owner.
 */
const sendOrderResult = asyncHandler(async (req, res) => {
  const wilayahId = req.user.wilayah_id;
  const branchIds = await getBranchIdsForWilayah(wilayahId);
  const { id: orderId } = req.params;
  const { channel } = req.body;

  const order = await Order.findByPk(orderId, {
    include: [{ model: User, as: 'User', attributes: ['id', 'name', 'email'] }]
  });
  if (!order) return res.status(404).json({ success: false, message: 'Order tidak ditemukan' });
  if (!branchIds.includes(order.branch_id)) return res.status(403).json({ success: false, message: 'Bukan order wilayah Anda' });

  await Notification.create({
    user_id: order.owner_id,
    trigger: NOTIFICATION_TRIGGER.ORDER_COMPLETED,
    title: 'Order selesai',
    message: `Order ${order.order_number} telah selesai.`,
    data: { order_id: order.id, order_number: order.order_number },
    channel_in_app: true,
    channel_email: channel === 'email' || channel === 'both',
    channel_whatsapp: channel === 'whatsapp' || channel === 'both'
  });

  res.json({ success: true, message: 'Notifikasi telah dikirim ke owner.', data: { order_id: order.id } });
});

module.exports = {
  getDashboard,
  listOrders,
  sendOrderResult,
  getBranchIdsForWilayah
};
