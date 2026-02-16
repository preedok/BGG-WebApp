const asyncHandler = require('express-async-handler');
const { Op } = require('sequelize');
const { Invoice, Order, OrderItem, User, Branch, PaymentProof } = require('../models');
const { INVOICE_STATUS } = require('../constants');

// Role accounting bekerja di pusat: filter cabang untuk lihat order/invoice per cabang atau seluruh cabang.
const isAccountingPusat = (user) => user && user.role === 'role_accounting';

/**
 * GET /api/v1/accounting/dashboard
 * Rekapitulasi seluruh perusahaan: piutang, terbayar, per status, per cabang. Filter opsional.
 */
const getDashboard = asyncHandler(async (req, res) => {
  const { branch_id, date_from, date_to } = req.query;
  const where = {};
  if (!isAccountingPusat(req.user) && req.user.branch_id && !['super_admin', 'admin_pusat'].includes(req.user.role)) {
    where.branch_id = req.user.branch_id;
  } else if (branch_id) {
    where.branch_id = branch_id;
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

  const invoices = await Invoice.findAll({
    where,
    include: [
      { model: Order, as: 'Order', attributes: ['id', 'order_number', 'status'] },
      { model: User, as: 'User', attributes: ['id', 'name', 'company_name'] },
      { model: Branch, as: 'Branch', attributes: ['id', 'code', 'name'] }
    ],
    order: [['created_at', 'DESC']]
  });

  let totalReceivable = 0;
  let totalPaid = 0;
  const byStatus = {};
  const byBranch = {};
  invoices.forEach(inv => {
    const j = inv.toJSON();
    byStatus[j.status] = (byStatus[j.status] || 0) + 1;
    const bid = j.branch_id;
    if (bid) {
      byBranch[bid] = byBranch[bid] || { branch_name: j.Branch?.name, code: j.Branch?.code, count: 0, receivable: 0, paid: 0 };
      byBranch[bid].count += 1;
      byBranch[bid].receivable += parseFloat(j.remaining_amount || 0);
      byBranch[bid].paid += parseFloat(j.paid_amount || 0);
    }
    totalReceivable += parseFloat(j.remaining_amount || 0);
    totalPaid += parseFloat(j.paid_amount || 0);
  });

  const branches = await Branch.findAll({
    where: { is_active: true },
    attributes: ['id', 'code', 'name'],
    order: [['code', 'ASC']]
  });

  res.json({
    success: true,
    data: {
      branches,
      summary: {
        total_invoices: invoices.length,
        total_receivable: totalReceivable,
        total_paid: totalPaid,
        by_status: byStatus,
        by_branch: Object.entries(byBranch).map(([id, v]) => ({ branch_id: id, ...v }))
      },
      invoices_recent: invoices.slice(0, 15)
    }
  });
});

/**
 * GET /api/v1/accounting/aging
 * Laporan aging piutang: current, 1-30, 31-60, 61+ hari.
 */
const getAgingReport = asyncHandler(async (req, res) => {
  const { branch_id } = req.query;
  const where = { status: { [Op.in]: [INVOICE_STATUS.TENTATIVE, INVOICE_STATUS.PARTIAL_PAID, INVOICE_STATUS.OVERDUE] } };
  if (!isAccountingPusat(req.user) && req.user.branch_id && !['super_admin', 'admin_pusat'].includes(req.user.role)) {
    where.branch_id = req.user.branch_id;
  } else if (branch_id) where.branch_id = branch_id;

  const invoices = await Invoice.findAll({
    where,
    include: [
      { model: Order, as: 'Order', attributes: ['id', 'order_number'] },
      { model: User, as: 'User', attributes: ['id', 'name', 'company_name'] },
      { model: Branch, as: 'Branch', attributes: ['id', 'code', 'name'] }
    ]
  });

  const now = new Date();
  const buckets = { current: [], days_1_30: [], days_31_60: [], days_61_plus: [] };
  let totalCurrent = 0;
  let total1_30 = 0;
  let total31_60 = 0;
  let total61Plus = 0;

  invoices.forEach(inv => {
    const due = inv.due_date_dp ? new Date(inv.due_date_dp) : new Date(inv.created_at);
    const daysOverdue = Math.floor((now - due) / (24 * 60 * 60 * 1000));
    const remaining = parseFloat(inv.remaining_amount || 0);
    if (remaining <= 0) return;
    const row = { ...inv.toJSON(), days_overdue: daysOverdue };
    if (daysOverdue <= 0) {
      buckets.current.push(row);
      totalCurrent += remaining;
    } else if (daysOverdue <= 30) {
      buckets.days_1_30.push(row);
      total1_30 += remaining;
    } else if (daysOverdue <= 60) {
      buckets.days_31_60.push(row);
      total31_60 += remaining;
    } else {
      buckets.days_61_plus.push(row);
      total61Plus += remaining;
    }
  });

  res.json({
    success: true,
    data: {
      buckets,
      totals: { current: totalCurrent, days_1_30: total1_30, days_31_60: total31_60, days_61_plus: total61Plus },
      total_outstanding: totalCurrent + total1_30 + total31_60 + total61Plus
    }
  });
});

/**
 * GET /api/v1/accounting/payments
 * Daftar pembayaran (payment proofs) untuk rekonsiliasi.
 */
const getPaymentsList = asyncHandler(async (req, res) => {
  const { branch_id, verified, date_from, date_to } = req.query;
  const invWhere = {};
  if (!isAccountingPusat(req.user) && req.user.branch_id && !['super_admin', 'admin_pusat'].includes(req.user.role)) {
    invWhere.branch_id = req.user.branch_id;
  } else if (branch_id) invWhere.branch_id = branch_id;

  const invoices = await Invoice.findAll({
    where: invWhere,
    attributes: ['id'],
    raw: true
  });
  const invoiceIds = invoices.map(i => i.id);

  const ppWhere = { invoice_id: invoiceIds };
  if (verified !== undefined) {
    if (verified === 'true') ppWhere.verified_at = { [Op.ne]: null };
    else ppWhere.verified_at = null;
  }
  if (date_from || date_to) {
    ppWhere.created_at = {};
    if (date_from) ppWhere.created_at[Op.gte] = new Date(date_from);
    if (date_to) {
      const d = new Date(date_to);
      d.setHours(23, 59, 59, 999);
      ppWhere.created_at[Op.lte] = d;
    }
  }

  const payments = await PaymentProof.findAll({
    where: ppWhere,
    include: [
      { model: Invoice, as: 'Invoice', include: [{ model: Order, as: 'Order' }, { model: User, as: 'User', attributes: ['id', 'name', 'company_name'] }] }
    ],
    order: [['created_at', 'DESC']],
    limit: 100
  });

  res.json({ success: true, data: payments });
});

/**
 * GET /api/v1/accounting/invoices
 * List invoice dengan filter cabang. Query: branch_id (opsional), status. Tanpa branch_id = semua cabang (order terbaru).
 */
const listInvoices = asyncHandler(async (req, res) => {
  const { status, branch_id } = req.query;
  const where = {};
  if (status) where.status = status;
  if (!isAccountingPusat(req.user) && req.user.branch_id && !['super_admin', 'admin_pusat'].includes(req.user.role)) {
    where.branch_id = req.user.branch_id;
  } else if (branch_id) where.branch_id = branch_id;

  const invoices = await Invoice.findAll({
    where,
    include: [
      { model: Order, as: 'Order', attributes: ['id', 'order_number', 'total_amount', 'status'] },
      { model: User, as: 'User', attributes: ['id', 'name', 'email', 'company_name'] },
      { model: Branch, as: 'Branch', attributes: ['id', 'code', 'name'] },
      { model: PaymentProof, as: 'PaymentProofs', required: false }
    ],
    order: [['created_at', 'DESC']]
  });

  res.json({ success: true, data: invoices });
});

/**
 * GET /api/v1/accounting/orders
 * Daftar order untuk accounting: filter branch_id (opsional). Tanpa branch_id = semua cabang, terbaru dulu.
 */
const listOrders = asyncHandler(async (req, res) => {
  const { branch_id, status, limit } = req.query;
  const where = {};
  if (branch_id) where.branch_id = branch_id;
  if (status) where.status = status;

  const orders = await Order.findAll({
    where,
    include: [
      { model: User, as: 'User', attributes: ['id', 'name', 'email', 'company_name'] },
      { model: Branch, as: 'Branch', attributes: ['id', 'code', 'name'] },
      { model: OrderItem, as: 'OrderItems' }
    ],
    order: [['created_at', 'DESC']],
    limit: Math.min(parseInt(limit, 10) || 100, 500)
  });

  res.json({ success: true, data: orders });
});

/**
 * GET /api/v1/accounting/financial-report
 * Laporan keuangan ringkas: pendapatan (dari pembayaran terverifikasi) per periode & per cabang.
 * Period: month, quarter, year. date_from, date_to untuk custom range.
 */
const getFinancialReport = asyncHandler(async (req, res) => {
  const { period, year, month, date_from, date_to } = req.query;
  let startDate;
  let endDate = new Date();
  if (date_from && date_to) {
    startDate = new Date(date_from);
    endDate = new Date(date_to);
    endDate.setHours(23, 59, 59, 999);
  } else {
    const y = parseInt(year || endDate.getFullYear(), 10);
    if (period === 'year') {
      startDate = new Date(y, 0, 1);
      endDate = new Date(y, 11, 31, 23, 59, 59);
    } else if (period === 'quarter') {
      const q = Math.min(3, Math.max(0, parseInt(month || '1', 10) - 1));
      const qStart = q * 3;
      startDate = new Date(y, qStart, 1);
      endDate = new Date(y, qStart + 3, 0, 23, 59, 59);
    } else {
      const m = parseInt(month || (endDate.getMonth() + 1), 10) - 1;
      startDate = new Date(y, m, 1);
      endDate = new Date(y, m + 1, 0, 23, 59, 59);
    }
  }

  const invoices = await Invoice.findAll({
    where: { created_at: { [Op.between]: [startDate, endDate] } },
    include: [
      { model: Branch, as: 'Branch', attributes: ['id', 'code', 'name'] },
      { model: PaymentProof, as: 'PaymentProofs', required: false }
    ]
  });

  let totalRevenue = 0;
  const byBranch = {};
  invoices.forEach(inv => {
    const paid = parseFloat(inv.paid_amount || 0);
    totalRevenue += paid;
    const bid = inv.branch_id || 'none';
    byBranch[bid] = byBranch[bid] || { branch_id: bid, branch_name: inv.Branch?.name || 'Lainnya', revenue: 0 };
    byBranch[bid].revenue += paid;
  });

  res.json({
    success: true,
    data: {
      period: { start: startDate, end: endDate },
      total_revenue: totalRevenue,
      by_branch: Object.values(byBranch),
      invoice_count: invoices.length
    }
  });
});

/**
 * GET /api/v1/accounting/reconciliation
 * Daftar pembayaran untuk rekonsiliasi bank. Filter: reconciled (true/false), date_from, date_to.
 */
const getReconciliation = asyncHandler(async (req, res) => {
  const { reconciled, date_from, date_to } = req.query;
  const where = {};
  if (reconciled === 'true') where.reconciled_at = { [Op.ne]: null };
  else if (reconciled === 'false') where.reconciled_at = null;
  if (date_from || date_to) {
    where.created_at = {};
    if (date_from) where.created_at[Op.gte] = new Date(date_from);
    if (date_to) {
      const d = new Date(date_to);
      d.setHours(23, 59, 59, 999);
      where.created_at[Op.lte] = d;
    }
  }

  const payments = await PaymentProof.findAll({
    where,
    include: [
      { model: Invoice, as: 'Invoice', include: [{ model: Order, as: 'Order' }, { model: User, as: 'User', attributes: ['id', 'name', 'company_name'] }, { model: Branch, as: 'Branch', attributes: ['id', 'code', 'name'] }] }
    ],
    order: [['created_at', 'DESC']],
    limit: 200
  });

  res.json({ success: true, data: payments });
});

/**
 * POST /api/v1/accounting/payments/:id/reconcile
 * Tandai bukti pembayaran sudah direkonsiliasi (rekonsiliasi bank).
 */
const reconcilePayment = asyncHandler(async (req, res) => {
  const proof = await PaymentProof.findByPk(req.params.id, { include: [{ model: Invoice, as: 'Invoice' }] });
  if (!proof) return res.status(404).json({ success: false, message: 'Bukti pembayaran tidak ditemukan' });
  await proof.update({ reconciled_at: new Date(), reconciled_by: req.user.id });
  res.json({ success: true, data: proof, message: 'Berhasil ditandai rekonsiliasi' });
});

module.exports = {
  getDashboard,
  getAgingReport,
  getPaymentsList,
  listInvoices,
  listOrders,
  getFinancialReport,
  getReconciliation,
  reconcilePayment
};
