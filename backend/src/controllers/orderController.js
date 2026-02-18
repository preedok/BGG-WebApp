const asyncHandler = require('express-async-handler');
const { Op } = require('sequelize');
const { Order, OrderItem, User, Branch, Provinsi, OwnerProfile, Invoice, Notification } = require('../models');
const { getRulesForBranch } = require('./businessRuleController');
const { NOTIFICATION_TRIGGER } = require('../constants');
const { getEffectivePrice } = require('./productController');
const { ORDER_ITEM_TYPE, ROOM_CAPACITY } = require('../constants');
const { syncInvoiceFromOrder, createInvoiceForOrder } = require('./invoiceController');
const { getBranchIdsForWilayah } = require('../utils/wilayahScope');

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

  // Invoice koordinator & admin koordinator: lihat order semua cabang di wilayah mereka
  const isKoordinatorOrInvoiceKoordinator = ['admin_koordinator', 'invoice_koordinator'].includes(req.user.role);
  let branchIdsWilayah = [];
  let effectiveWilayahId = req.user.wilayah_id;
  if (isKoordinatorOrInvoiceKoordinator) {
    if (!effectiveWilayahId && req.user.branch_id) {
      const branch = await Branch.findByPk(req.user.branch_id, {
        attributes: ['id'],
        include: [{ model: Provinsi, as: 'Provinsi', attributes: ['wilayah_id'], required: false }]
      });
      if (branch?.Provinsi?.wilayah_id) effectiveWilayahId = branch.Provinsi.wilayah_id;
    }
    if (effectiveWilayahId) {
      branchIdsWilayah = await getBranchIdsForWilayah(effectiveWilayahId);
      if (branchIdsWilayah.length > 0) {
        where.branch_id = branch_id ? (branchIdsWilayah.includes(branch_id) ? branch_id : 'none') : { [Op.in]: branchIdsWilayah };
      } else if (req.user.branch_id) {
        where.branch_id = req.user.branch_id;
      }
    } else if (req.user.branch_id) {
      where.branch_id = req.user.branch_id;
    }
  } else if (req.user.branch_id && !['super_admin', 'admin_pusat'].includes(req.user.role)) {
    where.branch_id = req.user.branch_id;
  }

  if (provinsi_id || wilayah_id) {
    const branchWhere = { is_active: true };
    if (provinsi_id) branchWhere.provinsi_id = provinsi_id;
    const branchOpts = { where: branchWhere, attributes: ['id'] };
    if (wilayah_id) {
      branchOpts.include = [{ model: Provinsi, as: 'Provinsi', attributes: [], required: true, where: { wilayah_id } }];
    }
    let branchIds = (await Branch.findAll(branchOpts)).map(r => r.id);
    if (isKoordinatorOrInvoiceKoordinator && branchIdsWilayah.length > 0 && branchIds.length > 0) {
      branchIds = branchIds.filter(id => branchIdsWilayah.includes(id));
    }
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
  // Gunakan branch_id dari body hanya jika benar-benar string non-kosong (body tanpa branch_id = undefined)
  const bodyBranchOk = typeof branch_id === 'string' && branch_id.trim() !== '';
  let effectiveBranchId = bodyBranchOk ? branch_id.trim() : (req.user.branch_id || null);
  const isInvoiceRole = ['invoice_koordinator', 'role_invoice_saudi'].includes(req.user.role);

  // Untuk owner: ambil assigned_branch_id dari OwnerProfile jika belum ada branch_id
  if (req.user.role === 'owner' && !effectiveBranchId) {
    try {
      const profile = await OwnerProfile.findOne({
        where: { user_id: req.user.id },
        attributes: ['assigned_branch_id'],
        raw: true
      });
      if (profile && profile.assigned_branch_id) {
        const assigned = profile.assigned_branch_id;
        const assignedStr = typeof assigned === 'string' ? assigned.trim() : String(assigned).trim();
        if (assignedStr && assignedStr !== 'null' && assignedStr !== 'undefined' && assignedStr.length >= 10) {
          effectiveBranchId = assignedStr;
        }
      }
    } catch (err) {
      console.error('Error fetching owner profile:', err);
    }
  }

  // Role invoice (koordinator/saudi): jika kirim owner_id tanpa branch_id, ambil cabang dari owner tersebut
  if (isInvoiceRole && effectiveOwnerId && !effectiveBranchId) {
    try {
      const profile = await OwnerProfile.findOne({
        where: { user_id: effectiveOwnerId },
        attributes: ['assigned_branch_id'],
        raw: true
      });
      if (profile && profile.assigned_branch_id) {
        const assignedStr = String(profile.assigned_branch_id).trim();
        if (assignedStr.length >= 10) effectiveBranchId = assignedStr;
      }
    } catch (err) {
      console.error('Error fetching owner profile for invoice role:', err);
    }
  }
  
  // Validasi final: pastikan branchId adalah UUID string yang valid sebelum digunakan
  const branchIdStr = effectiveBranchId != null && effectiveBranchId !== undefined 
    ? String(effectiveBranchId).trim() 
    : '';
  
  // Validasi: harus ada, bukan string kosong, bukan 'undefined'/'null', dan minimal panjang UUID
  const finalBranchId = branchIdStr && branchIdStr !== 'undefined' && branchIdStr !== 'null' && branchIdStr.length >= 10 
    ? branchIdStr 
    : null;
  
  if (!finalBranchId) {
    console.log('Order create failed - no branch_id:', {
      role: req.user.role,
      bodyBranchId: branch_id,
      userBranchId: req.user.branch_id,
      effectiveBranchId,
      branchIdStr
    });
    const msg = req.user.role === 'owner'
      ? 'Owner belum di-assign cabang. Hubungi admin/koordinator untuk assign cabang.'
      : isInvoiceRole
        ? 'Owner yang dipilih belum memiliki cabang. Pilih owner lain atau hubungi admin untuk menetapkan cabang.'
        : 'Branch/cabang wajib. Pilih cabang atau pastikan akun owner sudah di-assign cabang.';
    return res.status(400).json({ success: false, message: msg });
  }
  
  console.log('Order create - using branch_id:', finalBranchId, 'for user:', req.user.id, 'role:', req.user.role);

  if (!items || !Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ success: false, message: 'Items order wajib' });
  }

  const rules = await getRulesForBranch(finalBranchId);
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
      unitPrice = await getEffectivePrice(productId, finalBranchId, effectiveOwnerId, it.meta || {}, it.currency || 'IDR');
      if (unitPrice == null) return res.status(400).json({ success: false, message: `Harga tidak ditemukan untuk product ${productId}` });
    }
    const st = qty * unitPrice;
    subtotal += st;
    if (it.type === ORDER_ITEM_TYPE.HOTEL && it.room_type && ROOM_CAPACITY[it.room_type] != null) {
      totalJamaah += qty * ROOM_CAPACITY[it.room_type];
    }
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

  // Final safety check sebelum create
  if (!finalBranchId || typeof finalBranchId !== 'string' || finalBranchId.length < 10) {
    return res.status(400).json({
      success: false,
      message: req.user.role === 'owner'
        ? 'Owner belum di-assign cabang. Hubungi admin/koordinator untuk assign cabang.'
        : 'Branch/cabang wajib. Pilih cabang atau pastikan akun owner sudah di-assign cabang.'
    });
  }

  let order;
  try {
    order = await Order.create({
      order_number: generateOrderNumber(),
      owner_id: effectiveOwnerId,
      branch_id: finalBranchId,
      total_jamaah: totalJamaah,
      subtotal,
      penalty_amount: penaltyAmount,
      total_amount: subtotal + penaltyAmount,
      status: 'draft',
      created_by: req.user.id,
      notes
    });
  } catch (createErr) {
    console.error('Error creating order:', createErr);
    if (createErr.name === 'SequelizeValidationError' || createErr.name === 'SequelizeDatabaseError') {
      const field = createErr.errors?.[0]?.path || createErr.original?.constraint;
      if (field === 'branch_id' || (createErr.message && createErr.message.includes('branch_id'))) {
        return res.status(400).json({
          success: false,
          message: req.user.role === 'owner'
            ? 'Owner belum di-assign cabang. Hubungi admin/koordinator untuk assign cabang.'
            : 'Branch/cabang wajib. Pilih cabang atau pastikan akun owner sudah di-assign cabang.'
        });
      }
    }
    return res.status(500).json({
      success: false,
      message: 'Gagal membuat order: ' + (createErr.message || 'Unknown error')
    });
  }

  for (const it of orderItems) {
    await OrderItem.create({ ...it, order_id: order.id });
  }

  const orderForInvoice = await Order.findByPk(order.id, {
    attributes: ['id', 'order_number', 'owner_id', 'branch_id', 'total_amount']
  });
  if (orderForInvoice) {
    try {
      const opts = {};
      if (req.body.dp_percentage != null) opts.dp_percentage = req.body.dp_percentage;
      if (req.body.dp_amount != null) opts.dp_amount = req.body.dp_amount;
      const inv = await createInvoiceForOrder(orderForInvoice, opts);
      if (inv) {
        console.log('Auto-created invoice', inv.invoice_number, 'for order', order.order_number);
      }
    } catch (invErr) {
      console.error('Auto-create invoice after order create failed:', invErr);
    }
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
 * Update order (tambah/kurang/ubah item) - recalc totals. Invoice otomatis di-update bila ada.
 * Owner boleh ubah order sebelum dan setelah DP/lunas; sistem update invoice terbaru.
 */
const update = asyncHandler(async (req, res) => {
  const order = await Order.findByPk(req.params.id, { include: [{ model: OrderItem, as: 'OrderItems' }] });
  if (!order) return res.status(404).json({ success: false, message: 'Order tidak ditemukan' });
  const canUpdate = req.user.role === 'invoice_koordinator' || (req.user.role === 'owner' && order.owner_id === req.user.id);
  if (!canUpdate) {
    return res.status(403).json({ success: false, message: 'Hanya owner (order sendiri) atau invoice koordinator yang dapat mengubah order' });
  }
  if (!['draft', 'tentative', 'confirmed', 'processing'].includes(order.status)) {
    return res.status(400).json({ success: false, message: 'Order hanya bisa diubah saat draft/tentative/confirmed/processing' });
  }
  const { items, notes } = req.body;
  if (items && Array.isArray(items)) {
    const rules = await getRulesForBranch(order.branch_id);
    const busMinPack = rules.bus_min_pack ?? 35;
    const busPenaltyIdr = rules.bus_penalty_idr ?? 500000;
    await OrderItem.destroy({ where: { order_id: order.id } });
    let subtotal = 0, totalJamaah = 0, penaltyAmount = 0;
    const isOwner = req.user.role === 'owner';
    for (const it of items) {
      const qty = parseInt(it.quantity, 10) || 1;
      let unitPrice;
      if (isOwner) {
        unitPrice = await getEffectivePrice(it.product_id, order.branch_id, order.owner_id, it.meta || {}, it.currency || 'IDR') || 0;
      } else {
        unitPrice = parseFloat(it.unit_price);
        if (unitPrice == null || isNaN(unitPrice)) {
          unitPrice = await getEffectivePrice(it.product_id, order.branch_id, order.owner_id, it.meta || {}, it.currency || 'IDR') || 0;
        }
      }
      const st = qty * (unitPrice || 0);
      subtotal += st;
      if (it.type === ORDER_ITEM_TYPE.HOTEL && it.room_type && ROOM_CAPACITY[it.room_type] != null) {
        totalJamaah += qty * ROOM_CAPACITY[it.room_type];
      }
      if (it.type === ORDER_ITEM_TYPE.BUS) {
        totalJamaah += qty;
        const seatDiff = Math.abs(qty - busMinPack);
        if (seatDiff > 0) penaltyAmount += seatDiff * busPenaltyIdr;
      }
      await OrderItem.create({
        order_id: order.id,
        type: it.type,
        product_ref_id: it.product_id,
        product_ref_type: it.product_ref_type || 'product',
        quantity: qty,
        unit_price: unitPrice || 0,
        subtotal: st,
        manifest_file_url: it.manifest_file_url || null,
        meta: { room_type: it.room_type, meal: it.meal, ...(it.meta || {}) }
      });
    }
    await order.update({
      subtotal,
      total_jamaah: totalJamaah,
      penalty_amount: penaltyAmount,
      total_amount: subtotal + penaltyAmount
    });
    await syncInvoiceFromOrder(order);
  }
  if (notes !== undefined) await order.update({ notes });
  const full = await Order.findByPk(order.id, { include: [{ model: OrderItem, as: 'OrderItems' }] });
  res.json({ success: true, data: full });
});

/**
 * DELETE /api/v1/orders/:id
 * Batalkan order (soft: status = cancelled). Hanya owner (order sendiri) dan invoice_koordinator.
 */
const destroy = asyncHandler(async (req, res) => {
  const order = await Order.findByPk(req.params.id);
  if (!order) return res.status(404).json({ success: false, message: 'Order tidak ditemukan' });
  const canDelete = req.user.role === 'invoice_koordinator' || (req.user.role === 'owner' && order.owner_id === req.user.id);
  if (!canDelete) {
    return res.status(403).json({ success: false, message: 'Hanya owner (order sendiri) atau invoice koordinator yang dapat membatalkan order' });
  }
  if (!['draft', 'tentative', 'confirmed', 'processing'].includes(order.status)) {
    return res.status(400).json({ success: false, message: 'Order hanya bisa dibatalkan saat draft/tentative/confirmed/processing' });
  }
  await order.update({ status: 'cancelled' });
  const inv = await Invoice.findOne({ where: { order_id: order.id } });
  if (inv) await inv.update({ status: 'canceled' });
  res.json({ success: true, message: 'Order dibatalkan', data: order });
});

/**
 * POST /api/v1/orders/:id/send-result
 * Kirim notifikasi hasil order ke owner. Scope: koordinator (order wilayahnya).
 */
const sendOrderResult = asyncHandler(async (req, res) => {
  const { id: orderId } = req.params;
  const { channel } = req.body || {};
  const order = await Order.findByPk(orderId, {
    include: [{ model: User, as: 'User', attributes: ['id', 'name', 'email'] }]
  });
  if (!order) return res.status(404).json({ success: false, message: 'Order tidak ditemukan' });

  const role = req.user.role;
  let allowed = false;
  if (['admin_koordinator', 'invoice_koordinator', 'tiket_koordinator', 'visa_koordinator'].includes(role) && req.user.wilayah_id) {
    const branchIds = await getBranchIdsForWilayah(req.user.wilayah_id);
    if (branchIds.includes(order.branch_id)) allowed = true;
  }
  if (!allowed) {
    return res.status(403).json({ success: false, message: 'Order tidak dalam scope Anda' });
  }

  await Notification.create({
    user_id: order.owner_id,
    trigger: NOTIFICATION_TRIGGER.ORDER_COMPLETED,
    title: 'Order selesai',
    message: `Order ${order.order_number} telah selesai. Hasil order dapat diunduh/dilihat di aplikasi.`,
    data: { order_id: order.id, order_number: order.order_number },
    channel_in_app: true,
    channel_email: channel === 'email' || channel === 'both',
    channel_whatsapp: channel === 'whatsapp' || channel === 'both'
  });

  res.json({ success: true, message: 'Notifikasi telah dikirim ke owner.', data: { order_id: order.id } });
});

module.exports = { list, create, getById, update, destroy, sendOrderResult };
