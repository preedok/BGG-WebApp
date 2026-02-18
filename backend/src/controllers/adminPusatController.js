const asyncHandler = require('express-async-handler');
const bcrypt = require('bcryptjs');
const { Op } = require('sequelize');
const ExcelJS = require('exceljs');
const PDFDocument = require('pdfkit');
const {
  Order,
  OrderItem,
  User,
  Branch,
  Provinsi,
  Wilayah,
  OwnerProfile,
  Invoice,
  HotelProgress,
  VisaProgress,
  TicketProgress,
  BusProgress,
  Product,
  ProductAvailability
} = require('../models');
const { ROLES, ORDER_ITEM_TYPE } = require('../constants');

/**
 * GET /api/v1/admin-pusat/dashboard
 * Rekapitulasi transaksi dan pekerjaan per cabang. Filter: branch_id, date_from, date_to.
 */
const getDashboard = asyncHandler(async (req, res) => {
  const { branch_id, date_from, date_to, status, provinsi_id, wilayah_id } = req.query;
  const whereOrder = {};
  if (branch_id) whereOrder.branch_id = branch_id;
  if (status) whereOrder.status = status;
  if (date_from || date_to) {
    whereOrder.created_at = {};
    if (date_from) whereOrder.created_at[Op.gte] = new Date(date_from);
    if (date_to) {
      const d = new Date(date_to);
      d.setHours(23, 59, 59, 999);
      whereOrder.created_at[Op.lte] = d;
    }
  }
  if (provinsi_id || wilayah_id) {
    const branchWhere = { is_active: true };
    if (provinsi_id) branchWhere.provinsi_id = provinsi_id;
    const branchOpts = { where: branchWhere, attributes: ['id'] };
    if (wilayah_id) {
      branchOpts.include = [{ model: Provinsi, as: 'Provinsi', attributes: [], required: true, where: { wilayah_id } }];
    }
    const branchIds = (await Branch.findAll(branchOpts)).map(r => r.id);
    if (branchIds.length > 0) {
      whereOrder.branch_id = branch_id ? (branchIds.includes(branch_id) ? branch_id : 'none') : { [Op.in]: branchIds };
    } else {
      whereOrder.branch_id = 'none';
    }
  }

  const branches = await Branch.findAll({ where: { is_active: true }, order: [['code', 'ASC']] });
  const branchWithProvinsi = await Branch.findAll({
    where: { is_active: true },
    attributes: ['id', 'code', 'name', 'provinsi_id'],
    include: [
      { model: Provinsi, as: 'Provinsi', attributes: ['id', 'name', 'kode', 'wilayah_id'], required: false,
        include: [{ model: Wilayah, as: 'Wilayah', attributes: ['id', 'name'], required: false }] }
    ]
  });
  const branchMap = branchWithProvinsi.reduce((acc, b) => {
    const j = b.toJSON();
    acc[j.id] = { provinsi_id: j.provinsi_id, provinsi_name: j.Provinsi?.name, wilayah_id: j.Provinsi?.Wilayah?.id, wilayah_name: j.Provinsi?.Wilayah?.name };
    return acc;
  }, {});

  const orderCounts = await Order.findAndCountAll({
    where: whereOrder,
    attributes: ['id', 'status', 'total_amount', 'branch_id', 'created_at'],
    include: [{ model: Branch, as: 'Branch', attributes: ['id', 'code', 'name', 'provinsi_id'], required: false,
      include: [{ model: Provinsi, as: 'Provinsi', attributes: ['id', 'name', 'wilayah_id'], required: false,
        include: [{ model: Wilayah, as: 'Wilayah', attributes: ['id', 'name'], required: false }] }] },
    { model: User, as: 'User', attributes: ['id', 'name'] }]
  });

  const byStatus = {};
  const byBranch = {};
  const byWilayah = {};
  const byProvinsi = {};
  let totalRevenue = 0;
  (orderCounts.rows || []).forEach(o => {
    const j = o.toJSON();
    byStatus[j.status] = (byStatus[j.status] || 0) + 1;
    const bid = j.branch_id;
    if (bid) {
      byBranch[bid] = byBranch[bid] || { branch_name: j.Branch?.name, code: j.Branch?.code, count: 0, revenue: 0 };
      byBranch[bid].count += 1;
      byBranch[bid].revenue += parseFloat(j.total_amount || 0);
      const provinsiId = j.Branch?.Provinsi?.id || j.Branch?.provinsi_id || branchMap[bid]?.provinsi_id;
      const wilayahId = j.Branch?.Provinsi?.Wilayah?.id || branchMap[bid]?.wilayah_id;
      const provinsiName = j.Branch?.Provinsi?.name || branchMap[bid]?.provinsi_name || 'Tanpa Provinsi';
      const wilayahName = j.Branch?.Provinsi?.Wilayah?.name || branchMap[bid]?.wilayah_name || 'Tanpa Wilayah';
      if (wilayahId) {
        byWilayah[wilayahId] = byWilayah[wilayahId] || { wilayah_name: wilayahName, count: 0, revenue: 0 };
        byWilayah[wilayahId].count += 1;
        byWilayah[wilayahId].revenue += parseFloat(j.total_amount || 0);
      } else {
        byWilayah['_none'] = byWilayah['_none'] || { wilayah_name: 'Tanpa Wilayah', count: 0, revenue: 0 };
        byWilayah['_none'].count += 1;
        byWilayah['_none'].revenue += parseFloat(j.total_amount || 0);
      }
      if (provinsiId) {
        byProvinsi[provinsiId] = byProvinsi[provinsiId] || { provinsi_name: provinsiName, count: 0, revenue: 0 };
        byProvinsi[provinsiId].count += 1;
        byProvinsi[provinsiId].revenue += parseFloat(j.total_amount || 0);
      } else {
        byProvinsi['_none'] = byProvinsi['_none'] || { provinsi_name: 'Tanpa Provinsi', count: 0, revenue: 0 };
        byProvinsi['_none'].count += 1;
        byProvinsi['_none'].revenue += parseFloat(j.total_amount || 0);
      }
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
      orders: {
        total: orderCounts.count,
        by_status: byStatus,
        by_branch: Object.entries(byBranch).map(([id, v]) => ({ branch_id: id, ...v })),
        by_wilayah: Object.entries(byWilayah).map(([id, v]) => ({ wilayah_id: id === '_none' ? null : id, ...v })),
        by_provinsi: Object.entries(byProvinsi).map(([id, v]) => ({ provinsi_id: id === '_none' ? null : id, ...v })),
        total_revenue: totalRevenue
      },
      invoices: { total: invoices.length, by_status: invoiceByStatus },
      owners_total: ownersCount,
      orders_recent: ordersRecent
    }
  });
});

/**
 * GET /api/v1/admin-pusat/users
 * Daftar user (Super Admin / Admin Pusat). Untuk manajemen user.
 */
const USER_ALLOWED_SORT = ['name', 'email', 'role', 'created_at'];

const listUsers = asyncHandler(async (req, res) => {
  const { role, branch_id, region, is_active, limit = 25, page = 1, sort_by, sort_order } = req.query;
  const where = {};
  if (role) where.role = role;
  if (branch_id) where.branch_id = branch_id;
  if (region) where.region = region;
  // Filter is_active: 'true'/'1' = aktif, 'false'/'0' = nonaktif, undefined = hanya aktif (default)
  if (is_active !== undefined && is_active !== '') {
    where.is_active = is_active === 'true' || is_active === '1';
  } else {
    where.is_active = true; // default: hanya tampilkan akun aktif (yang belum dihapus)
  }

  const lim = Math.min(Math.max(parseInt(limit, 10) || 25, 1), 500);
  const pg = Math.max(parseInt(page, 10) || 1, 1);
  const offset = (pg - 1) * lim;

  const sortCol = USER_ALLOWED_SORT.includes(sort_by) ? sort_by : 'created_at';
  const sortDir = (sort_order || '').toLowerCase() === 'asc' ? 'ASC' : 'DESC';

  const { count, rows } = await User.findAndCountAll({
    where,
    attributes: ['id', 'email', 'name', 'role', 'branch_id', 'region', 'company_name', 'is_active', 'created_at'],
    include: [{ model: Branch, as: 'Branch', attributes: ['id', 'code', 'name'], required: false }],
    order: [[sortCol, sortDir]],
    limit: lim,
    offset,
    distinct: true
  });
  const totalPages = Math.ceil(count / lim) || 1;
  res.json({
    success: true,
    data: rows,
    pagination: { total: count, page: pg, limit: lim, totalPages }
  });
});

/**
 * POST /api/v1/admin-pusat/users
 * Buat akun: role_bus, role_hotel (Saudi), admin_wilayah, admin_provinsi
 */
const createUser = asyncHandler(async (req, res) => {
  const { name, email, password, role, branch_id, region } = req.body;
  const allowedRoles = [ROLES.ROLE_BUS, ROLES.ROLE_HOTEL, ROLES.ADMIN_WILAYAH, ROLES.ADMIN_PROVINSI];
  if (!name || !email || !password || !role) {
    return res.status(400).json({ success: false, message: 'name, email, password, role wajib' });
  }
  if (!allowedRoles.includes(role)) {
    return res.status(400).json({ success: false, message: 'Role harus role_bus, role_hotel, admin_wilayah, atau admin_provinsi' });
  }
  if (role === ROLES.ADMIN_WILAYAH && !region) {
    return res.status(400).json({ success: false, message: 'admin_wilayah wajib punya region (wilayah: Sumatra, Jawa, dll)' });
  }
  if (role === ROLES.ADMIN_PROVINSI && !region) {
    return res.status(400).json({ success: false, message: 'admin_provinsi wajib punya region (provinsi)' });
  }

  const existing = await User.findOne({ where: { email: email.toLowerCase() } });
  if (existing) return res.status(400).json({ success: false, message: 'Email sudah terdaftar' });

  const finalBranchId = [ROLES.ROLE_BUS, ROLES.ROLE_HOTEL, ROLES.ADMIN_WILAYAH, ROLES.ADMIN_PROVINSI].includes(role) ? null : (branch_id || null);
  const finalRegion = [ROLES.ADMIN_WILAYAH, ROLES.ADMIN_PROVINSI].includes(role) ? (region || '').trim() : null;

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
    region: finalRegion,
    is_active: true
  });

  const u = user.toJSON();
  delete u.password_hash;
  res.status(201).json({ success: true, message: 'Akun berhasil dibuat', data: u });
});

/**
 * PATCH /api/v1/admin-pusat/users/:id
 * Update akun: name, email, password (password opsional)
 */
const updateUser = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { name, email, password, is_active } = req.body;
  const user = await User.findByPk(id);
  if (!user) return res.status(404).json({ success: false, message: 'Akun tidak ditemukan' });

  const updates = {};
  if (name !== undefined) updates.name = name.trim();
  if (is_active !== undefined) updates.is_active = is_active === true || is_active === 'true' || is_active === '1';
  if (email !== undefined) {
    const newEmail = email.toLowerCase().trim();
    if (newEmail !== user.email) {
      const existing = await User.findOne({ where: { email: newEmail } });
      if (existing) return res.status(400).json({ success: false, message: 'Email sudah digunakan oleh pengguna lain' });
      updates.email = newEmail;
    }
  }
  if (password && String(password).length >= 6) {
    const salt = await bcrypt.genSalt(10);
    updates.password_hash = await bcrypt.hash(password, salt);
  }
  if (Object.keys(updates).length > 0) {
    await user.update(updates);
  }
  const u = user.toJSON();
  delete u.password_hash;
  res.json({ success: true, message: 'Akun berhasil diperbarui', data: u });
});

/**
 * DELETE /api/v1/admin-pusat/users/:id
 * Soft delete: set is_active = false agar data hilang dari daftar (tanpa kena FK constraint)
 */
const deleteUser = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const user = await User.findByPk(id);
  if (!user) return res.status(404).json({ success: false, message: 'Akun tidak ditemukan' });
  await user.update({ is_active: false });
  res.json({ success: true, message: 'Akun berhasil dihapus' });
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

module.exports = {
  getDashboard,
  listUsers,
  createUser,
  updateUser,
  deleteUser,
  setProductAvailability
};
