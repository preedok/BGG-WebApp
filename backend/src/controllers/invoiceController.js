const asyncHandler = require('express-async-handler');
const { Invoice, Order, User, Branch, PaymentProof } = require('../models');
const { INVOICE_STATUS, BUSINESS_RULES } = require('../constants');

const generateInvoiceNumber = () => {
  const y = new Date().getFullYear();
  const n = Math.floor(Math.random() * 99999) + 1;
  return `INV-${y}-${String(n).padStart(5, '0')}`;
};

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
      { model: Order, as: 'Order', attributes: ['id', 'order_number', 'total_amount'] },
      { model: User, as: 'User', attributes: ['id', 'name', 'email', 'company_name'] }
    ],
    order: [['created_at', 'DESC']]
  });
  res.json({ success: true, data: invoices });
});

/**
 * POST /api/v1/invoices
 * Buat invoice dari order. Status awal: draft atau tentative
 */
const create = asyncHandler(async (req, res) => {
  const { order_id } = req.body;
  const order = await Order.findByPk(order_id, { include: ['OrderItems'] });
  if (!order) return res.status(404).json({ success: false, message: 'Order tidak ditemukan' });
  if (order.owner_id !== req.user.id && !['role_invoice', 'admin_cabang', 'admin_pusat', 'super_admin'].includes(req.user.role)) {
    return res.status(403).json({ success: false, message: 'Akses ditolak' });
  }

  const totalAmount = parseFloat(order.total_amount);
  const dpPercentage = req.body.is_super_promo ? BUSINESS_RULES.DP_PERCENTAGE_SUPER_PROMO : BUSINESS_RULES.DP_PERCENTAGE_NORMAL;
  const dpAmount = Math.round(totalAmount * dpPercentage / 100);
  const dueDateDp = new Date();
  dueDateDp.setDate(dueDateDp.getDate() + BUSINESS_RULES.DP_DUE_DAYS);
  const autoCancelAt = new Date();
  autoCancelAt.setHours(autoCancelAt.getHours() + BUSINESS_RULES.DP_GRACE_HOURS);

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
      'Invoice tentative batal otomatis bila dalam 1x24 jam setelah issued belum ada DP',
      `Minimal DP ${dpPercentage}% dari total`,
      'Jatuh tempo DP 3 hari setelah issued'
    ]
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
  res.json({ success: true, data: invoice });
});

module.exports = { list, create, getById };
