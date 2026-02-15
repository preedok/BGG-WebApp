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
  Product,
  ProductAvailability,
  FlyerTemplate
} = require('../models');
const { ROLES, ORDER_ITEM_TYPE } = require('../constants');

/**
 * GET /api/v1/admin-pusat/dashboard
 * Rekapitulasi transaksi dan pekerjaan per cabang. Filter: branch_id, date_from, date_to.
 */
const getDashboard = asyncHandler(async (req, res) => {
  const { branch_id, date_from, date_to } = req.query;
  const whereOrder = {};
  if (branch_id) whereOrder.branch_id = branch_id;
  if (date_from || date_to) {
    whereOrder.created_at = {};
    if (date_from) whereOrder.created_at[Op.gte] = new Date(date_from);
    if (date_to) {
      const d = new Date(date_to);
      d.setHours(23, 59, 59, 999);
      whereOrder.created_at[Op.lte] = d;
    }
  }

  const branches = await Branch.findAll({ where: { is_active: true }, order: [['code', 'ASC']] });
  const orderCounts = await Order.findAndCountAll({
    where: whereOrder,
    attributes: ['id', 'status', 'total_amount', 'branch_id', 'created_at'],
    include: [{ model: Branch, as: 'Branch', attributes: ['id', 'code', 'name'] }, { model: User, as: 'User', attributes: ['id', 'name'] }]
  });

  const byStatus = {};
  const byBranch = {};
  let totalRevenue = 0;
  (orderCounts.rows || []).forEach(o => {
    const j = o.toJSON();
    byStatus[j.status] = (byStatus[j.status] || 0) + 1;
    const bid = j.branch_id;
    if (bid) {
      byBranch[bid] = byBranch[bid] || { branch_name: j.Branch?.name, code: j.Branch?.code, count: 0, revenue: 0 };
      byBranch[bid].count += 1;
      byBranch[bid].revenue += parseFloat(j.total_amount || 0);
    }
    if (!['draft', 'cancelled'].includes(j.status)) totalRevenue += parseFloat(j.total_amount || 0);
  });

  const invoices = await Invoice.findAll({
    where: branch_id ? { branch_id } : {},
    attributes: ['id', 'status', 'total_amount', 'branch_id'],
    raw: true
  });
  const invoiceByStatus = {};
  invoices.forEach(i => { invoiceByStatus[i.status] = (invoiceByStatus[i.status] || 0) + 1; });

  const ownersCount = await OwnerProfile.count({
    where: branch_id ? { assigned_branch_id: branch_id } : {}
  });

  const ordersRecent = await Order.findAll({
    where: whereOrder,
    include: [{ model: User, as: 'User', attributes: ['id', 'name'] }, { model: Branch, as: 'Branch', attributes: ['id', 'code', 'name'] }],
    order: [['created_at', 'DESC']],
    limit: 15
  });

  res.json({
    success: true,
    data: {
      branches,
      orders: { total: orderCounts.count, by_status: byStatus, by_branch: Object.entries(byBranch).map(([id, v]) => ({ branch_id: id, ...v })), total_revenue: totalRevenue },
      invoices: { total: invoices.length, by_status: invoiceByStatus },
      owners_total: ownersCount,
      orders_recent: ordersRecent
    }
  });
});

/**
 * GET /api/v1/admin-pusat/combined-recap
 * Rekap gabungan seluruh proses pekerjaan dan orderan di semua cabang. Filter: branch_id, date_from, date_to.
 */
const getCombinedRecap = asyncHandler(async (req, res) => {
  const { branch_id, date_from, date_to } = req.query;
  const whereOrder = {};
  if (branch_id) whereOrder.branch_id = branch_id;
  if (date_from || date_to) {
    whereOrder.created_at = {};
    if (date_from) whereOrder.created_at[Op.gte] = new Date(date_from);
    if (date_to) {
      const d = new Date(date_to);
      d.setHours(23, 59, 59, 999);
      whereOrder.created_at[Op.lte] = d;
    }
  }

  const orders = await Order.findAll({
    where: whereOrder,
    include: [
      { model: Branch, as: 'Branch', attributes: ['id', 'code', 'name'] },
      { model: User, as: 'User', attributes: ['id', 'name'] },
      {
        model: OrderItem,
        as: 'OrderItems',
        include: [
          { model: HotelProgress, as: 'HotelProgress', required: false },
          { model: VisaProgress, as: 'VisaProgress', required: false },
          { model: TicketProgress, as: 'TicketProgress', required: false },
          { model: BusProgress, as: 'BusProgress', required: false }
        ]
      }
    ],
    order: [['created_at', 'DESC']]
  });

  const invoices = await Invoice.findAll({
    where: branch_id ? { branch_id } : {},
    include: [{ model: Order, as: 'Order', attributes: ['id', 'order_number'] }]
  });

  const recap = {
    total_orders: orders.length,
    total_invoices: invoices.length,
    orders_by_branch: {},
    orders_by_status: {},
    items_hotel: 0,
    items_visa: 0,
    items_ticket: 0,
    items_bus: 0
  };

  orders.forEach(o => {
    const j = o.toJSON();
    recap.orders_by_status[j.status] = (recap.orders_by_status[j.status] || 0) + 1;
    const bid = j.branch_id || 'none';
    recap.orders_by_branch[bid] = (recap.orders_by_branch[bid] || 0) + 1;
    (j.OrderItems || []).forEach(item => {
      if (item.type === ORDER_ITEM_TYPE.HOTEL) recap.items_hotel += 1;
      if (item.type === ORDER_ITEM_TYPE.VISA) recap.items_visa += 1;
      if (item.type === ORDER_ITEM_TYPE.TICKET) recap.items_ticket += 1;
      if (item.type === ORDER_ITEM_TYPE.BUS) recap.items_bus += 1;
    });
  });

  res.json({
    success: true,
    data: {
      recap,
      orders: orders.slice(0, 50),
      branches: await Branch.findAll({ where: { is_active: true }, attributes: ['id', 'code', 'name'] })
    }
  });
});

/**
 * GET /api/v1/admin-pusat/users
 * Daftar user (Super Admin / Admin Pusat). Untuk manajemen user.
 */
const listUsers = asyncHandler(async (req, res) => {
  const { role, branch_id, is_active } = req.query;
  const where = {};
  if (role) where.role = role;
  if (branch_id) where.branch_id = branch_id;
  if (is_active !== undefined && is_active !== '') where.is_active = is_active === 'true' || is_active === '1';

  const users = await User.findAll({
    where,
    attributes: ['id', 'email', 'name', 'role', 'branch_id', 'company_name', 'is_active', 'created_at'],
    include: [{ model: Branch, as: 'Branch', attributes: ['id', 'code', 'name'], required: false }],
    order: [['created_at', 'DESC']]
  });
  res.json({ success: true, data: users });
});

/**
 * POST /api/v1/admin-pusat/users
 * Buat akun role_bus atau role_hotel (tidak terikat cabang - bertugas di Saudi). Atau akun admin_cabang untuk cabang tertentu.
 */
const createUser = asyncHandler(async (req, res) => {
  const { name, email, password, role, branch_id } = req.body;
  const allowedRoles = [ROLES.ROLE_BUS, ROLES.ROLE_HOTEL, ROLES.ADMIN_CABANG];
  if (!name || !email || !password || !role) {
    return res.status(400).json({ success: false, message: 'name, email, password, role wajib' });
  }
  if (!allowedRoles.includes(role)) {
    return res.status(400).json({ success: false, message: 'Role harus role_bus, role_hotel, atau admin_cabang' });
  }
  if (role === ROLES.ADMIN_CABANG && !branch_id) {
    return res.status(400).json({ success: false, message: 'admin_cabang wajib punya branch_id' });
  }

  const existing = await User.findOne({ where: { email: email.toLowerCase() } });
  if (existing) return res.status(400).json({ success: false, message: 'Email sudah terdaftar' });

  const finalBranchId = (role === ROLES.ROLE_BUS || role === ROLES.ROLE_HOTEL) ? null : branch_id;
  if (finalBranchId) {
    const branch = await Branch.findByPk(finalBranchId);
    if (!branch) return res.status(404).json({ success: false, message: 'Cabang tidak ditemukan' });
  }

  const user = await User.create({
    email: email.toLowerCase(),
    password_hash: password,
    name,
    role,
    branch_id: finalBranchId,
    is_active: true
  });

  const u = user.toJSON();
  delete u.password_hash;
  res.status(201).json({ success: true, message: 'Akun berhasil dibuat', data: u });
});

/**
 * PUT /api/v1/admin-pusat/products/:id/availability
 * Set ketersediaan awal (acuan general) untuk product. Role hotel/tiket/visa update real-time di flow masing-masing.
 */
const setProductAvailability = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { quantity, meta } = req.body;
  const product = await Product.findByPk(id);
  if (!product) return res.status(404).json({ success: false, message: 'Product tidak ditemukan' });

  let availability = await ProductAvailability.findOne({ where: { product_id: id } });
  if (!availability) {
    availability = await ProductAvailability.create({
      product_id: id,
      quantity: quantity != null ? Number(quantity) : 0,
      meta: meta || {},
      updated_by: req.user.id
    });
  } else {
    await availability.update({
      quantity: quantity != null ? Number(quantity) : availability.quantity,
      meta: meta !== undefined ? meta : availability.meta,
      updated_by: req.user.id
    });
  }
  const data = await ProductAvailability.findByPk(availability.id, {
    include: [{ model: Product, as: 'Product', attributes: ['id', 'code', 'name', 'type'] }]
  });
  res.json({ success: true, data });
});

/**
 * GET /api/v1/admin-pusat/flyers - list semua flyer (admin)
 * GET /api/v1/admin-pusat/flyers/published - list yang published (bisa dipakai role lain)
 */
const listFlyers = asyncHandler(async (req, res) => {
  const { type, product_id, is_published } = req.query;
  const where = {};
  if (type) where.type = type;
  if (product_id) where.product_id = product_id;
  if (is_published !== undefined) where.is_published = is_published === 'true';

  const flyers = await FlyerTemplate.findAll({
    where,
    include: [
      { model: Product, as: 'Product', attributes: ['id', 'code', 'name', 'type'] },
      { model: User, as: 'CreatedBy', attributes: ['id', 'name'] }
    ],
    order: [['updated_at', 'DESC']]
  });
  res.json({ success: true, data: flyers });
});

const listPublishedFlyers = asyncHandler(async (req, res) => {
  const flyers = await FlyerTemplate.findAll({
    where: { is_published: true },
    include: [{ model: Product, as: 'Product', attributes: ['id', 'code', 'name', 'type'] }],
    order: [['published_at', 'DESC']]
  });
  res.json({ success: true, data: flyers });
});

const createFlyer = asyncHandler(async (req, res) => {
  const { name, type, product_id, design_content, thumbnail_url } = req.body;
  if (!name || !type) return res.status(400).json({ success: false, message: 'name dan type wajib' });
  if (!['product', 'package'].includes(type)) return res.status(400).json({ success: false, message: 'type harus product atau package' });
  if (product_id) {
    const p = await Product.findByPk(product_id);
    if (!p) return res.status(404).json({ success: false, message: 'Product tidak ditemukan' });
  }
  const flyer = await FlyerTemplate.create({
    name,
    type,
    product_id: product_id || null,
    design_content: design_content || null,
    thumbnail_url: thumbnail_url || null,
    is_published: false,
    created_by: req.user.id
  });
  const data = await FlyerTemplate.findByPk(flyer.id, {
    include: [{ model: Product, as: 'Product', attributes: ['id', 'code', 'name'] }]
  });
  res.status(201).json({ success: true, data });
});

const updateFlyer = asyncHandler(async (req, res) => {
  const flyer = await FlyerTemplate.findByPk(req.params.id);
  if (!flyer) return res.status(404).json({ success: false, message: 'Flyer tidak ditemukan' });
  const { name, type, product_id, design_content, thumbnail_url } = req.body;
  if (type && !['product', 'package'].includes(type)) return res.status(400).json({ success: false, message: 'type harus product atau package' });
  await flyer.update({
    ...(name !== undefined && { name }),
    ...(type !== undefined && { type }),
    ...(product_id !== undefined && { product_id: product_id || null }),
    ...(design_content !== undefined && { design_content }),
    ...(thumbnail_url !== undefined && { thumbnail_url })
  });
  const data = await FlyerTemplate.findByPk(flyer.id, {
    include: [{ model: Product, as: 'Product', attributes: ['id', 'code', 'name'] }]
  });
  res.json({ success: true, data });
});

const deleteFlyer = asyncHandler(async (req, res) => {
  const flyer = await FlyerTemplate.findByPk(req.params.id);
  if (!flyer) return res.status(404).json({ success: false, message: 'Flyer tidak ditemukan' });
  await flyer.destroy();
  res.json({ success: true, message: 'Flyer dihapus' });
});

const publishFlyer = asyncHandler(async (req, res) => {
  const flyer = await FlyerTemplate.findByPk(req.params.id);
  if (!flyer) return res.status(404).json({ success: false, message: 'Flyer tidak ditemukan' });
  await flyer.update({ is_published: true, published_at: new Date() });
  const data = await FlyerTemplate.findByPk(flyer.id, {
    include: [{ model: Product, as: 'Product', attributes: ['id', 'code', 'name'] }]
  });
  res.json({ success: true, data, message: 'Flyer diluncurkan' });
});

module.exports = {
  getDashboard,
  getCombinedRecap,
  listUsers,
  createUser,
  setProductAvailability,
  listFlyers,
  listPublishedFlyers,
  createFlyer,
  updateFlyer,
  deleteFlyer,
  publishFlyer
};
