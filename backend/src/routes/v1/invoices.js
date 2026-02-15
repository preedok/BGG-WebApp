const express = require('express');
const router = express.Router();
const invoiceController = require('../../controllers/invoiceController');
const paymentProofController = require('../../controllers/paymentProofController');
const { auth, requireRole } = require('../../middleware/auth');
const { ROLES } = require('../../constants');

router.use(auth);

router.get('/', invoiceController.list);
router.post('/', requireRole(ROLES.OWNER, ROLES.ROLE_INVOICE, ROLES.ADMIN_CABANG, ROLES.ADMIN_PUSAT, ROLES.SUPER_ADMIN), invoiceController.create);
router.get('/:id', invoiceController.getById);
router.patch('/:id/unblock', requireRole(ROLES.ROLE_INVOICE, ROLES.ADMIN_CABANG, ROLES.ADMIN_PUSAT, ROLES.SUPER_ADMIN), invoiceController.unblock);
router.post('/:id/verify-payment', requireRole(ROLES.ROLE_INVOICE, ROLES.ADMIN_CABANG, ROLES.ADMIN_PUSAT, ROLES.SUPER_ADMIN, ROLES.ROLE_ACCOUNTING), invoiceController.verifyPayment);
router.patch('/:id/overpaid', requireRole(ROLES.ROLE_INVOICE, ROLES.ADMIN_CABANG, ROLES.ADMIN_PUSAT, ROLES.SUPER_ADMIN), invoiceController.handleOverpaid);
router.post('/:id/payment-proofs', paymentProofController.create);

module.exports = router;
