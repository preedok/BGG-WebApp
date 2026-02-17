const asyncHandler = require('express-async-handler');
const { Op } = require('sequelize');
const { Order, OrderItem, User, Branch, Provinsi } = require('../models');
const { getRulesForBranch } = require('./businessRuleController');
const { getEffectivePrice } = require('./productController');
const { ORDER_ITEM_TYPE } = require('../constants');

const generateOrderNumber = () => {
  const y = new Date().getFullYear();
  const n = Math.floor(Math.random() * 99999) + 1;
  return `ORD-${y}-${String(n).padStart(5, '0')}`;
};

/**
 * GET /api/v1/orders
 */
const ALLOWED_SORT = ['order_number', 'created_at', 'total_amount', 'status'];

const list = asyncHandler(async (req, res) => {
  const { status, branch_id, owner_id, limit = 25, page = 1, sort_by, sort_order, date_from, date_to, order_number, provinsi_id, wilayah_id } = req.query;
  const where = {};
  if (status) where.status = status;
  if (branch_id) where.branch_id = branch_id;
  if (owner_id) where.owner_id = owner_id;
  if (order_number && String(order_number).trim()) {
    where.order_number = { [Op.iLike]: `%${String(order_number).trim()}%` };
  }
  if (date_from || date_to) {
    where.created_at = {};
    if (date_from) where.created_at[Op.gte] = new Date(date_from);
    if (date_to) {
      const d = new Date(date_to);
      d.setHours(23, 59, 59, 999);
      where.created_at[Op.lte] = d;
    }
  }
  if (req.user.role === 'owner') where.owner_id = req.user.id;
  if (req.user.branch_id && !['super_admin', 'admin_pusat'].includes(req.user.role)) {
    where.branch_id = req.user.branch_id;
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
      where.branch_id = branch_id ? (branchIds.includes(branch_id) ? branch_id : 'none') : { [Op.in]: branchIds };
    } else {
      where.branch_id = 'none';
    }
  }

  const lim = Math.min(Math.max(parseInt(limit, 10) || 25, 1), 500);
  const pg = Math.max(parseInt(page, 10) || 1, 1);
  const offset = (pg - 1) * lim;

  const sortCol = ALLOWED_SORT.includes(sort_by) ? sort_by : 'created_at';
  const sortDir = (sort_order || '').toLowerCase() === 'asc' ? 'ASC' : 'DESC';

  const { count, rows } = await Order.findAndCountAll({
    where,
    include: [
      { model: User, as: 'User', attributes: ['id', 'name', 'email', 'company_name'] },
      { model: Branch, as: 'Branch', attributes: ['id', 'code', 'name'] },
      { model: OrderItem, as: 'OrderItems' }
    ],
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
 * POST /api/v1/orders
 * Items: [{ product_id, type, quantity, unit_price (optional - resolved if not sent), room_type?, meal?, meta? }]
 * Validasi: require_hotel_with_visa, bus min pack penalty from business rules.
 */
const create = asyncHandler(async (req, res) => {
  const { items, branch_id, owner_id, notes } = req.body;
  const effectiveOwnerId = owner_id || req.user.id;
  const effectiveBranchId = branch_id || req.user.branch_id;

  if (!items || !Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ success: false, message: 'Items order wajib' });
  }

  const rules = await getRulesForBranch(effectiveBranchId);
  const hasVisa = items.some(i => i.type === ORDER_ITEM_TYPE.VISA);
  const hasHotel = items.some(i => i.type === ORDER_ITEM_TYPE.HOTEL);
  if (rules.require_hotel_with_visa && hasVisa && !hasHotel) {
    return res.status(400).json({ success: false, message: 'Visa wajib bersama hotel' });
  }

  const busMinPack = rules.bus_min_pack ?? 35;
  const busPenaltyIdr = rules.bus_penalty_idr ?? 500000;
  let subtotal = 0;
  let totalJamaah = 0;
  let penaltyAmount = 0;
  const orderItems = [];

  for (const it of items) {
    const qty = parseInt(it.quantity, 10) || 1;
    let unitPrice = parseFloat(it.unit_price);
    if (unitPrice == null || isNaN(unitPrice)) {
      const productId = it.product_id;
      if (!productId) return res.status(400).json({ success: false, message: 'product_id atau unit_price wajib per item' });
      unitPrice = await getEffectivePrice(productId, effectiveBranchId, effectiveOwnerId, it.meta || {}, it.currency || 'IDR');
      if (unitPrice == null) return res.status(400).json({ success: false, message: `Harga tidak ditemukan untuk product ${productId}` });
    }
    const st = qty * unitPrice;
    subtotal += st;
    if (it.type === ORDER_ITEM_TYPE.BUS) {
      totalJamaah += qty;
      const seatDiff = Math.abs(qty - busMinPack);
      if (seatDiff > 0) penaltyAmount += seatDiff * busPenaltyIdr;
    }
    orderItems.push({
      type: it.type,
      product_ref_id: it.product_id,
      product_ref_type: 'product',
      quantity: qty,
      unit_price: unitPrice,
      subtotal: st,
      manifest_file_url: it.manifest_file_url || null,
      meta: {
        room_type: it.room_type,
        meal: it.meal,
        ...(it.meta || {})
      }
    });
  }

  const order = await Order.create({
    order_number: generateOrderNumber(),
    owner_id: effectiveOwnerId,
    branch_id: effectiveBranchId,
    total_jamaah: totalJamaah,
    subtotal,
    penalty_amount: penaltyAmount,
    total_amount: subtotal + penaltyAmount,
    status: 'draft',
    created_by: req.user.id,
    notes
  });

  for (const it of orderItems) {
    await OrderItem.create({ ...it, order_id: order.id });
  }

  const full = await Order.findByPk(order.id, {
    include: [{ model: OrderItem, as: 'OrderItems' }]
  });
  res.status(201).json({ success: true, data: full });
});

/**
 * GET /api/v1/orders/:id
 */
const getById = asyncHandler(async (req, res) => {
  const order = await Order.findByPk(req.params.id, {
    include: [
      { model: User, as: 'User', attributes: ['id', 'name', 'email', 'company_name'] },
      { model: Branch, as: 'Branch' },
      { model: OrderItem, as: 'OrderItems' }
    ]
  });
  if (!order) return res.status(404).json({ success: false, message: 'Order tidak ditemukan' });
  if (req.user.role === 'owner' && order.owner_id !== req.user.id) {
    return res.status(403).json({ success: false, message: 'Akses ditolak' });
  }
  res.json({ success: true, data: order });
});

/**
 * PATCH /api/v1/orders/:id
 * Update order (e.g. add/remove items, change qty) - recalc totals. Role invoice / admin.
 */
const update = asyncHandler(async (req, res) => {
  const order = await Order.findByPk(req.params.id, { include: [{ model: OrderItem, as: 'OrderItems' }] });
  if (!order) return res.status(404).json({ success: false, message: 'Order tidak ditemukan' });
  const allowed = ['super_admin', 'role_invoice'];
  if (!allowed.includes(req.user.role) && order.owner_id !== req.user.id) {
    return res.status(403).json({ success: false, message: 'Akses ditolak' });
  }
  if (!['draft', 'tentative'].includes(order.status)) {
    return res.status(400).json({ success: false, message: 'Order hanya bisa diubah saat draft/tentative' });
  }
  const { items, notes } = req.body;
  if (items && Array.isArray(items)) {
    const rules = await getRulesForBranch(order.branch_id);
    const busMinPack = rules.bus_min_pack ?? 35;
    const busPenaltyIdr = rules.bus_penalty_idr ?? 500000;
    await OrderItem.destroy({ where: { order_id: order.id } });
    let subtotal = 0, totalJamaah = 0, penaltyAmount = 0;
    for (const it of items) {
      const qty = parseInt(it.quantity, 10) || 1;
      let unitPrice = parseFloat(it.unit_price);
      if (unitPrice == null || isNaN(unitPrice) && it.product_id) {
        unitPrice = await getEffectivePrice(it.product_id, order.branch_id, order.owner_id, {}, it.currency || 'IDR') || 0;
      }
      const st = qty * (unitPrice || 0);
      subtotal += st;
      if (it.type === ORDER_ITEM_TYPE.BUS) {
        totalJamaah += qty;
        const seatDiff = Math.abs(qty - busMinPack);
        if (seatDiff > 0) penaltyAmount += seatDiff * busPenaltyIdr;
      }
      await OrderItem.create({
        order_id: order.id,
        type: it.type,
        product_ref_id: it.product_id,
        product_ref_type: 'product',
        quantity: qty,
        unit_price: unitPrice || 0,
        subtotal: st,
        meta: it.meta || {}
      });
    }
    await order.update({
      subtotal,
      total_jamaah: totalJamaah,
      penalty_amount: penaltyAmount,
      total_amount: subtotal + penaltyAmount
    });
  }
  if (notes !== undefined) await order.update({ notes });
  const full = await Order.findByPk(order.id, { include: [{ model: OrderItem, as: 'OrderItems' }] });
  res.json({ success: true, data: full });
});

module.exports = { list, create, getById, update };
