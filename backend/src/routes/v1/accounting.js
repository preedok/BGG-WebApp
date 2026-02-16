const express = require('express');
const router = express.Router();
const { auth, requireRole } = require('../../middleware/auth');
const { ROLES } = require('../../constants');
const accountingController = require('../../controllers/accountingController');

router.use(auth);
router.use(requireRole(ROLES.ROLE_ACCOUNTING));

router.get('/dashboard', accountingController.getDashboard);
router.get('/aging', accountingController.getAgingReport);
router.get('/payments', accountingController.getPaymentsList);
router.get('/invoices', accountingController.listInvoices);
router.get('/orders', accountingController.listOrders);
router.get('/financial-report', accountingController.getFinancialReport);
router.get('/reconciliation', accountingController.getReconciliation);
router.post('/payments/:id/reconcile', accountingController.reconcilePayment);

module.exports = router;
