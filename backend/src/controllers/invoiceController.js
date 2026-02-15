const asyncHandler = require('express-async-handler');
const { Invoice, Order, User, Branch, PaymentProof, Notification } = require('../models');
const { INVOICE_STATUS, NOTIFICATION_TRIGGER } = require('../constants');
const { getRulesForBranch } = require('./businessRuleController');

const generateInvoiceNumber = () => {
  const y = new Date().getFullYear();
  const n = Math.floor(Math.random() * 99999) + 1;
  return `INV-${y}-${String(n).padStart(5, '0')}`;
};

async function ensureBlockedStatus(invoice) {
  if (invoice.status !== INVOICE_STATUS.TENTATIVE || invoice.is_blocked) return;
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
const list = asyncHandler(async (req, res) => {
  const { status, branch_id, owner_id } = req.query;
  const where = {};
  if (status) where.status = status;
  if (branch_id) where.branch_id = branch_id;
  if (owner_id) where.owner_id = owner_id;
  if (req.user.role === 'owner') where.owner_id = req.user.id;
  if (req.user.branch_id && !['super_admin', 'admin_pusat'].includes(req.user.role)) {
    where.branch_id = req.user.branch_id;
  }

  const invoices = await Invoice.findAll({
    where,
    include: [
      { model: Order, as: 'Order', attributes: ['id', 'order_number', 'total_amount', 'status'] },
      { model: User, as: 'User', attributes: ['id', 'name', 'email', 'company_name'] },
      { model: PaymentProof, as: 'PaymentProofs', required: false }
    ],
    order: [['created_at', 'DESC']]
  });

  for (const inv of invoices) await ensureBlockedStatus(inv);
  res.json({ success: true, data: invoices });
});

/**
 * POST /api/v1/invoices
 * Create invoice from order. Status tentative, auto_cancel_at = now + dp_grace_hours.
 */
const create = asyncHandler(async (req, res) => {
  const { order_id, is_super_promo } = req.body;
  const order = await Order.findByPk(order_id, { include: ['OrderItems'] });
  if (!order) return res.status(404).json({ success: false, message: 'Order tidak ditemukan' });
  if (order.owner_id !== req.user.id && !['role_invoice', 'admin_cabang', 'admin_pusat', 'super_admin'].includes(req.user.role)) {
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
      { model: PaymentProof, as: 'PaymentProofs' }
    ]
  });
  if (!invoice) return res.status(404).json({ success: false, message: 'Invoice tidak ditemukan' });
  if (req.user.role === 'owner' && invoice.owner_id !== req.user.id) {
    return res.status(403).json({ success: false, message: 'Akses ditolak' });
  }
  await ensureBlockedStatus(invoice);
  res.json({ success: true, data: invoice });
});

/**
 * PATCH /api/v1/invoices/:id/unblock
 * Role invoice: aktifkan kembali order yang diblokir (lewat waktu DP).
 */
const unblock = asyncHandler(async (req, res) => {
  const invoice = await Invoice.findByPk(req.params.id);
  if (!invoice) return res.status(404).json({ success: false, message: 'Invoice tidak ditemukan' });
  if (!['role_invoice', 'admin_cabang', 'admin_pusat', 'super_admin'].includes(req.user.role)) {
    return res.status(403).json({ success: false, message: 'Hanya role invoice/admin yang dapat unblock' });
  }
  await invoice.update({
    is_blocked: false,
    unblocked_by: req.user.id,
    unblocked_at: new Date()
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
  const proof = await PaymentProof.findByPk(payment_proof_id);
  if (!proof || proof.invoice_id !== req.params.id) return res.status(404).json({ success: false, message: 'Bukti bayar tidak ditemukan' });
  if (!['role_invoice', 'admin_cabang', 'admin_pusat', 'super_admin', 'role_accounting'].includes(req.user.role)) {
    return res.status(403).json({ success: false, message: 'Tidak berwenang verifikasi' });
  }
  const invoice = await Invoice.findByPk(proof.invoice_id);
  if (verified) {
    await proof.update({ verified_by: req.user.id, verified_at: new Date(), notes: notes || proof.notes });
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
    await Notification.create({
      user_id: invoice.owner_id,
      trigger: newStatus === INVOICE_STATUS.PAID ? NOTIFICATION_TRIGGER.LUNAS : NOTIFICATION_TRIGGER.DP_RECEIVED,
      title: newStatus === INVOICE_STATUS.PAID ? 'Invoice lunas' : 'DP diterima',
      message: `Pembayaran untuk ${invoice.invoice_number} telah diverifikasi.`,
      data: { invoice_id: invoice.id }
    });
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

module.exports = {
  list,
  create,
  getById,
  unblock,
  verifyPayment,
  handleOverpaid,
  ensureBlockedStatus
};
