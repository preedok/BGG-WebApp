const fs = require('fs');
const path = require('path');
const { Op } = require('sequelize');
const asyncHandler = require('express-async-handler');
const sequelize = require('../config/sequelize');
const { Invoice, InvoiceFile, Order, User, Branch, PaymentProof, Notification, Provinsi, Wilayah } = require('../models');
const { INVOICE_STATUS, NOTIFICATION_TRIGGER } = require('../constants');
const { getRulesForBranch } = require('./businessRuleController');
const { buildInvoicePdfBuffer } = require('../utils/invoicePdf');
const { SUBDIRS, getDir, invoiceFilename, toUrlPath } = require('../config/uploads');

const generateInvoiceNumber = () => {
  const y = new Date().getFullYear();
  const n = Math.floor(Math.random() * 99999) + 1;
  return `INV-${y}-${String(n).padStart(5, '0')}`;
};

async function ensureBlockedStatus(invoice) {
  if (invoice.status !== INVOICE_STATUS.TENTATIVE || invoice.is_blocked) return;
  if (invoice.unblocked_at) return;
  const at = invoice.auto_cancel_at ? new Date(invoice.auto_cancel_at) : null;
  if (at && new Date() > at && parseFloat(invoice.paid_amount) === 0) {
    await invoice.update({ is_blocked: true });
    const order = await Order.findByPk(invoice.order_id);
    if (order) await order.update({ status: 'blocked', blocked_at: new Date(), blocked_reason: 'DP lewat 1x24 jam' });
  }
}

/**
 * GET /api/v1/invoices
 */
const ALLOWED_SORT = ['invoice_number', 'created_at', 'total_amount', 'status'];

async function resolveBranchFilterList(branch_id, provinsi_id, wilayah_id, user) {
  if (user?.branch_id && !['super_admin', 'admin_pusat', 'role_accounting'].includes(user?.role)) return { branch_id: user.branch_id };
  if (branch_id) return { branch_id };
  if (provinsi_id) {
    const branches = await Branch.findAll({ where: { provinsi_id, is_active: true }, attributes: ['id'] });
    const ids = branches.map(b => b.id);
    return ids.length ? { branch_id: { [Op.in]: ids } } : { branch_id: { [Op.in]: [] } };
  }
  if (wilayah_id) {
    const branches = await Branch.findAll({
      where: { is_active: true },
      attributes: ['id'],
      include: [{ model: Provinsi, as: 'Provinsi', attributes: [], required: true, where: { wilayah_id } }]
    });
    const ids = branches.map(b => b.id);
    return ids.length ? { branch_id: { [Op.in]: ids } } : { branch_id: { [Op.in]: [] } };
  }
  return {};
}

const list = asyncHandler(async (req, res) => {
  const { status, branch_id, provinsi_id, wilayah_id, owner_id, order_status, invoice_number, order_number, date_from, date_to, due_status, limit = 25, page = 1, sort_by, sort_order } = req.query;
  const where = {};
  if (status) where.status = status;
  const branchFilter = await resolveBranchFilterList(branch_id, provinsi_id, wilayah_id, req.user);
  if (Object.keys(branchFilter).length) Object.assign(where, branchFilter);
  if (owner_id) where.owner_id = owner_id;
  if (invoice_number) where.invoice_number = { [Op.iLike]: `%${String(invoice_number).trim()}%` };
  if (date_from || date_to) {
    where.issued_at = {};
    if (date_from) where.issued_at[Op.gte] = new Date(date_from);
    if (date_to) {
      const d = new Date(date_to);
      d.setHours(23, 59, 59, 999);
      where.issued_at[Op.lte] = d;
    }
  }
  if (due_status) {
    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0);
    const endOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);
    if (due_status === 'current') {
      where.due_date_dp = { [Op.gt]: endOfToday };
    } else if (due_status === 'due') {
      where.due_date_dp = { [Op.between]: [startOfToday, endOfToday] };
    } else if (due_status === 'overdue') {
      where.due_date_dp = { [Op.lt]: startOfToday };
      where.remaining_amount = { [Op.gt]: 0 };
    }
  }
  if (req.user.role === 'owner') where.owner_id = req.user.id;
  if (req.user.branch_id && !['super_admin', 'admin_pusat'].includes(req.user.role)) {
    where.branch_id = req.user.branch_id;
  }

  const orderInclude = { model: Order, as: 'Order', attributes: ['id', 'order_number', 'total_amount', 'currency', 'status', 'created_at'] };
  if (order_status || order_number) {
    orderInclude.required = true;
    orderInclude.where = {};
    if (order_status) orderInclude.where.status = order_status;
    if (order_number) orderInclude.where.order_number = { [Op.iLike]: `%${String(order_number).trim()}%` };
  }

  const lim = Math.min(Math.max(parseInt(limit, 10) || 25, 1), 500);
  const pg = Math.max(parseInt(page, 10) || 1, 1);
  const offset = (pg - 1) * lim;

  const sortCol = ALLOWED_SORT.includes(sort_by) ? sort_by : 'created_at';
  const sortDir = (sort_order || '').toLowerCase() === 'asc' ? 'ASC' : 'DESC';

  const { count, rows } = await Invoice.findAndCountAll({
    where,
    include: [
      orderInclude,
      { model: User, as: 'User', attributes: ['id', 'name', 'email', 'company_name'] },
      { model: Branch, as: 'Branch', attributes: ['id', 'code', 'name'], required: false },
      { model: PaymentProof, as: 'PaymentProofs', required: false }
    ],
    order: [[sortCol, sortDir]],
    limit: lim,
    offset,
    distinct: true
  });

  for (const inv of rows) await ensureBlockedStatus(inv);
  const totalPages = Math.ceil(count / lim) || 1;

  const [totalAmount, totalPaid, totalRemaining, invoiceRows, orderRows] = await Promise.all([
    Invoice.sum('total_amount', { where, include: [orderInclude] }),
    Invoice.sum('paid_amount', { where, include: [orderInclude] }),
    Invoice.sum('remaining_amount', { where, include: [orderInclude] }),
    Invoice.findAll({ where, include: [orderInclude], attributes: ['status', 'order_id'], raw: true }),
    Invoice.findAll({
      where,
      include: [{ model: Order, as: 'Order', attributes: ['id', 'status'], required: !!(order_status || order_number), where: order_status || order_number ? (orderInclude.where || {}) : undefined }],
      attributes: ['order_id'],
      raw: true
    })
  ]);

  const orderIds = [...new Set((orderRows || []).map((r) => r.order_id).filter(Boolean))];
  const byInvoiceStatus = (invoiceRows || []).reduce((acc, r) => {
    acc[r.status] = (acc[r.status] || 0) + 1;
    return acc;
  }, {});
  let byOrderStatus = {};
  if (orderIds.length > 0) {
    const orders = await Order.findAll({ where: { id: { [Op.in]: orderIds } }, attributes: ['status'], raw: true });
    byOrderStatus = (orders || []).reduce((acc, r) => {
      acc[r.status] = (acc[r.status] || 0) + 1;
      return acc;
    }, {});
  }

  res.json({
    success: true,
    data: rows,
    pagination: { total: count, page: pg, limit: lim, totalPages },
    summary: {
      total_invoices: count,
      total_orders: orderIds.length,
      total_amount: parseFloat(totalAmount || 0),
      total_paid: parseFloat(totalPaid || 0),
      total_remaining: parseFloat(totalRemaining || 0),
      by_invoice_status: byInvoiceStatus,
      by_order_status: byOrderStatus
    }
  });
});

/**
 * GET /api/v1/invoices/summary
 * Same query params as list (no page/limit). Returns aggregates for Order & Invoice stats.
 */
const getSummary = asyncHandler(async (req, res) => {
  const { status, branch_id, owner_id, order_status, invoice_number, order_number, date_from, date_to, due_status } = req.query;
  const where = {};
  if (status) where.status = status;
  if (branch_id) where.branch_id = branch_id;
  if (owner_id) where.owner_id = owner_id;
  if (invoice_number) where.invoice_number = { [Op.iLike]: `%${String(invoice_number).trim()}%` };
  if (date_from || date_to) {
    where.issued_at = {};
    if (date_from) where.issued_at[Op.gte] = new Date(date_from);
    if (date_to) {
      const d = new Date(date_to);
      d.setHours(23, 59, 59, 999);
      where.issued_at[Op.lte] = d;
    }
  }
  if (due_status) {
    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0);
    const endOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);
    if (due_status === 'current') where.due_date_dp = { [Op.gt]: endOfToday };
    else if (due_status === 'due') where.due_date_dp = { [Op.between]: [startOfToday, endOfToday] };
    else if (due_status === 'overdue') {
      where.due_date_dp = { [Op.lt]: startOfToday };
      where.remaining_amount = { [Op.gt]: 0 };
    }
  }
  if (req.user.role === 'owner') where.owner_id = req.user.id;
  if (req.user.branch_id && !['super_admin', 'admin_pusat'].includes(req.user.role)) {
    where.branch_id = req.user.branch_id;
  }

  const orderInclude = { model: Order, as: 'Order', attributes: ['id', 'status'] };
  if (order_status || order_number) {
    orderInclude.required = true;
    orderInclude.where = {};
    if (order_status) orderInclude.where.status = order_status;
    if (order_number) orderInclude.where.order_number = { [Op.iLike]: `%${String(order_number).trim()}%` };
  }

  const [totalInvoices, totalAmount, totalPaid, totalRemaining, invoiceRows, orderRows] = await Promise.all([
    Invoice.count({ where, include: [orderInclude], distinct: true }),
    Invoice.sum('total_amount', { where, include: [orderInclude] }),
    Invoice.sum('paid_amount', { where, include: [orderInclude] }),
    Invoice.sum('remaining_amount', { where, include: [orderInclude] }),
    Invoice.findAll({
      where,
      include: [orderInclude],
      attributes: ['status', 'order_id'],
      raw: true
    }),
    Invoice.findAll({
      where,
      include: [{ model: Order, as: 'Order', attributes: ['id', 'status'], required: !!(order_status || order_number), where: order_status || order_number ? (orderInclude.where || {}) : undefined }],
      attributes: ['order_id'],
      raw: true
    })
  ]);

  const orderIds = [...new Set((orderRows || []).map((r) => r.order_id).filter(Boolean))];
  const totalOrders = orderIds.length;
  const byStatus = (invoiceRows || []).reduce((acc, r) => {
    acc[r.status] = (acc[r.status] || 0) + 1;
    return acc;
  }, {});
  let byOrderStatus = {};
  if (orderIds.length > 0) {
    const orders = await Order.findAll({
      where: { id: { [Op.in]: orderIds } },
      attributes: ['status'],
      raw: true
    });
    byOrderStatus = (orders || []).reduce((acc, r) => {
      acc[r.status] = (acc[r.status] || 0) + 1;
      return acc;
    }, {});
  }

  res.json({
    success: true,
    data: {
      total_invoices: totalInvoices || 0,
      total_orders: totalOrders,
      total_amount: parseFloat(totalAmount || 0),
      total_paid: parseFloat(totalPaid || 0),
      total_remaining: parseFloat(totalRemaining || 0),
      by_invoice_status: byStatus,
      by_order_status: byOrderStatus
    }
  });
});

/**
 * POST /api/v1/invoices
 * Create invoice from order. Status tentative, auto_cancel_at = now + dp_grace_hours.
 */
const create = asyncHandler(async (req, res) => {
  const { order_id, is_super_promo } = req.body;
  const order = await Order.findByPk(order_id, { include: ['OrderItems'] });
  if (!order) return res.status(404).json({ success: false, message: 'Order tidak ditemukan' });
  if (order.owner_id !== req.user.id && !['role_invoice', 'super_admin'].includes(req.user.role)) {
    return res.status(403).json({ success: false, message: 'Akses ditolak' });
  }

  const existing = await Invoice.findOne({ where: { order_id } });
  if (existing) return res.status(400).json({ success: false, message: 'Order ini sudah memiliki invoice' });

  const rules = await getRulesForBranch(order.branch_id);
  const dpGraceHours = rules.dp_grace_hours ?? 24;
  const dpDueDays = rules.dp_due_days ?? 3;
  const totalAmount = parseFloat(order.total_amount);
  const dpPercentage = is_super_promo ? 50 : 30;
  const dpAmount = Math.round(totalAmount * dpPercentage / 100);
  const dueDateDp = new Date();
  dueDateDp.setDate(dueDateDp.getDate() + dpDueDays);
  const autoCancelAt = new Date();
  autoCancelAt.setHours(autoCancelAt.getHours() + dpGraceHours);

  const invoice = await Invoice.create({
    invoice_number: generateInvoiceNumber(),
    order_id: order.id,
    owner_id: order.owner_id,
    branch_id: order.branch_id,
    total_amount: totalAmount,
    dp_percentage: dpPercentage,
    dp_amount: dpAmount,
    paid_amount: 0,
    remaining_amount: totalAmount,
    status: INVOICE_STATUS.TENTATIVE,
    issued_at: new Date(),
    due_date_dp: dueDateDp,
    auto_cancel_at: autoCancelAt,
    is_overdue: false,
    terms: [
      `Invoice batal otomatis bila dalam ${dpGraceHours} jam setelah issued belum ada DP`,
      `Minimal DP ${dpPercentage}% dari total`,
      `Jatuh tempo DP ${dpDueDays} hari setelah issued`
    ]
  });

  await Notification.create({
    user_id: order.owner_id,
    trigger: NOTIFICATION_TRIGGER.INVOICE_CREATED,
    title: 'Invoice baru',
    message: `Invoice ${invoice.invoice_number} untuk order ${order.order_number}. Silakan bayar DP dalam ${dpGraceHours} jam.`,
    data: { order_id: order.id, invoice_id: invoice.id }
  });

  const full = await Invoice.findByPk(invoice.id, { include: [{ model: Order, as: 'Order' }] });
  res.status(201).json({ success: true, data: full });
});

/**
 * GET /api/v1/invoices/:id
 */
const getById = asyncHandler(async (req, res) => {
  const invoice = await Invoice.findByPk(req.params.id, {
    include: [
      { model: Order, as: 'Order', include: ['OrderItems'] },
      { model: User, as: 'User', attributes: ['id', 'name', 'email', 'company_name'] },
      { model: Branch, as: 'Branch', attributes: ['id', 'code', 'name'], required: false },
      { model: PaymentProof, as: 'PaymentProofs' }
    ]
  });
  if (!invoice) return res.status(404).json({ success: false, message: 'Invoice tidak ditemukan' });
  if (req.user.role === 'owner' && invoice.owner_id !== req.user.id) {
    return res.status(403).json({ success: false, message: 'Akses ditolak' });
  }
  await ensureBlockedStatus(invoice);
  const rules = await getRulesForBranch(invoice.branch_id);
  const data = invoice.toJSON();
  data.currency_rates = rules.currency_rates || {};
  res.json({ success: true, data });
});

/**
 * PATCH /api/v1/invoices/:id/unblock
 * Role invoice: aktifkan kembali order yang diblokir (lewat waktu DP).
 */
const unblock = asyncHandler(async (req, res) => {
  const invoice = await Invoice.findByPk(req.params.id);
  if (!invoice) return res.status(404).json({ success: false, message: 'Invoice tidak ditemukan' });
  if (!['invoice_koordinator', 'admin_koordinator', 'admin_pusat', 'super_admin'].includes(req.user.role)) {
    return res.status(403).json({ success: false, message: 'Tidak berwenang mengaktifkan invoice' });
  }
  const rules = await getRulesForBranch(invoice.branch_id);
  const dpGraceHours = Math.max(1, parseInt(rules.dp_grace_hours, 10) || 24);
  const newAutoCancelAt = new Date();
  newAutoCancelAt.setHours(newAutoCancelAt.getHours() + dpGraceHours);
  await invoice.update({
    is_blocked: false,
    unblocked_by: req.user.id,
    unblocked_at: new Date(),
    auto_cancel_at: newAutoCancelAt
  });
  const order = await Order.findByPk(invoice.order_id);
  if (order && order.status === 'blocked') {
    await order.update({ status: 'tentative', unblocked_by: req.user.id, unblocked_at: new Date(), blocked_at: null, blocked_reason: null });
  }
  await Notification.create({
    user_id: invoice.owner_id,
    trigger: NOTIFICATION_TRIGGER.INVOICE_CREATED,
    title: 'Invoice diaktifkan kembali',
    message: `Invoice ${invoice.invoice_number} dapat dibayar kembali. Silakan upload bukti DP.`,
    data: { invoice_id: invoice.id }
  });
  const full = await Invoice.findByPk(invoice.id, { include: [{ model: Order, as: 'Order' }] });
  res.json({ success: true, data: full });
});

/**
 * POST /api/v1/invoices/:id/verify-payment
 * Body: { payment_proof_id, verified (bool), notes? }
 */
const verifyPayment = asyncHandler(async (req, res) => {
  const { payment_proof_id, verified, notes } = req.body;
  const isApproved = verified === true || verified === 'true';
  const proof = await PaymentProof.findByPk(payment_proof_id);
  if (!proof || proof.invoice_id !== req.params.id) return res.status(404).json({ success: false, message: 'Bukti bayar tidak ditemukan' });
  if (!['admin_pusat', 'admin_koordinator', 'role_accounting', 'super_admin'].includes(req.user.role)) {
    return res.status(403).json({ success: false, message: 'Tidak berwenang verifikasi' });
  }
  const invoice = await Invoice.findByPk(proof.invoice_id);
  if (isApproved) {
    await proof.update({ verified_by: req.user.id, verified_at: new Date(), verified_status: 'verified', notes: notes || proof.notes });
    const newPaid = parseFloat(invoice.paid_amount) + parseFloat(proof.amount);
    const remaining = Math.max(0, parseFloat(invoice.total_amount) - newPaid);
    let newStatus = invoice.status;
    if (remaining <= 0) newStatus = INVOICE_STATUS.PAID;
    else if (parseFloat(invoice.dp_amount) > 0 && newPaid >= parseFloat(invoice.dp_amount)) newStatus = INVOICE_STATUS.PARTIAL_PAID;
    await invoice.update({
      paid_amount: newPaid,
      remaining_amount: remaining,
      status: newStatus
    });
    if (newStatus === INVOICE_STATUS.PAID) {
      const order = await Order.findByPk(invoice.order_id);
      if (order && !['completed', 'cancelled'].includes(order.status)) {
        await order.update({ status: 'processing' });
      }
    }
    await Notification.create({
      user_id: invoice.owner_id,
      trigger: newStatus === INVOICE_STATUS.PAID ? NOTIFICATION_TRIGGER.LUNAS : NOTIFICATION_TRIGGER.DP_RECEIVED,
      title: newStatus === INVOICE_STATUS.PAID ? 'Invoice lunas' : 'DP diterima',
      message: `Pembayaran untuk ${invoice.invoice_number} telah diverifikasi.`,
      data: { invoice_id: invoice.id }
    });
  } else {
    const wasVerified = proof.verified_status === 'verified' || (proof.verified_at != null);
    await proof.update({ verified_status: 'rejected', verified_by: null, verified_at: null, notes: notes || proof.notes });
    if (wasVerified) {
      const newPaid = Math.max(0, parseFloat(invoice.paid_amount) - parseFloat(proof.amount));
      const remaining = Math.max(0, parseFloat(invoice.total_amount) - newPaid);
      let newStatus = INVOICE_STATUS.TENTATIVE;
      if (remaining <= 0) newStatus = INVOICE_STATUS.PAID;
      else if (parseFloat(invoice.dp_amount) > 0 && newPaid >= parseFloat(invoice.dp_amount)) newStatus = INVOICE_STATUS.PARTIAL_PAID;
      await invoice.update({ paid_amount: newPaid, remaining_amount: remaining, status: newStatus });
    }
  }
  const full = await Invoice.findByPk(invoice.id, { include: [{ model: PaymentProof, as: 'PaymentProofs' }] });
  res.json({ success: true, data: full });
});

/**
 * PATCH /api/v1/invoices/:id/overpaid
 * Body: { handling: 'refund'|'transfer_invoice'|'transfer_order', target_invoice_id?, target_order_id? }
 */
const handleOverpaid = asyncHandler(async (req, res) => {
  const invoice = await Invoice.findByPk(req.params.id);
  if (!invoice) return res.status(404).json({ success: false, message: 'Invoice tidak ditemukan' });
  const overpaid = parseFloat(invoice.overpaid_amount || 0);
  if (overpaid <= 0) return res.status(400).json({ success: false, message: 'Tidak ada overpaid' });
  const { handling, target_invoice_id, target_order_id } = req.body;
  if (!['refund', 'transfer_invoice', 'transfer_order'].includes(handling)) {
    return res.status(400).json({ success: false, message: 'handling harus refund, transfer_invoice, atau transfer_order' });
  }
  await invoice.update({ overpaid_handling: handling, overpaid_amount: 0 });
  if (handling === 'transfer_invoice' && target_invoice_id) {
    const target = await Invoice.findByPk(target_invoice_id);
    if (target && target.owner_id === invoice.owner_id) {
      const newPaid = parseFloat(target.paid_amount) + overpaid;
      const remaining = Math.max(0, parseFloat(target.total_amount) - newPaid);
      await target.update({
        paid_amount: newPaid,
        remaining_amount: remaining,
        status: remaining <= 0 ? INVOICE_STATUS.PAID : target.status
      });
    }
  }
  const full = await Invoice.findByPk(invoice.id);
  res.json({ success: true, data: full });
});

/**
 * GET /api/v1/invoices/:id/pdf
 * Unduh invoice dalam format PDF. File disimpan ke disk (local) dan metadata ke DB.
 */
const getPdf = asyncHandler(async (req, res) => {
  const invoice = await Invoice.findByPk(req.params.id, {
    include: [
      { model: Order, as: 'Order', include: ['OrderItems'] },
      { model: User, as: 'User', attributes: ['id', 'name', 'email', 'company_name'] },
      { model: Branch, as: 'Branch', attributes: ['id', 'code', 'name'], required: false }
    ]
  });
  if (!invoice) return res.status(404).json({ success: false, message: 'Invoice tidak ditemukan' });
  if (req.user.role === 'owner' && invoice.owner_id !== req.user.id) {
    return res.status(403).json({ success: false, message: 'Akses ditolak' });
  }
  const data = invoice.toJSON();
  const buf = await buildInvoicePdfBuffer(data);

  // Simpan ke disk (local - uploads/invoices/)
  const dir = getDir(SUBDIRS.INVOICES);
  const fileName = invoiceFilename(invoice.invoice_number, invoice.status);
  const filePath = path.join(dir, fileName);
  fs.writeFileSync(filePath, buf, 'binary');

  // Simpan metadata ke database
  const relativePath = path.join(SUBDIRS.INVOICES, fileName).replace(/\\/g, '/');
  await InvoiceFile.upsert({
    invoice_id: invoice.id,
    order_id: invoice.order_id,
    status: invoice.status,
    file_path: relativePath,
    file_name: fileName,
    file_size: buf.length,
    is_example: false,
    generated_by: req.user?.id
  }, { conflictFields: ['invoice_id'] });

  const downloadName = `invoice-${invoice.invoice_number}.pdf`;
  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `attachment; filename="${downloadName}"`);
  res.send(buf);
});

module.exports = {
  list,
  getSummary,
  create,
  getById,
  getPdf,
  unblock,
  verifyPayment,
  handleOverpaid,
  ensureBlockedStatus
};
