const express = require('express');
const router = express.Router();
const orderController = require('../../controllers/orderController');
const { auth, requireRole, branchRestriction } = require('../../middleware/auth');
const { ROLES } = require('../../constants');

router.use(auth);

router.get('/', orderController.list);
router.post('/', requireRole(ROLES.OWNER, ROLES.INVOICE_KOORDINATOR), orderController.create);
router.get('/:id', orderController.getById);
router.patch('/:id', requireRole(ROLES.OWNER, ROLES.INVOICE_KOORDINATOR), orderController.update);
router.delete('/:id', requireRole(ROLES.OWNER, ROLES.INVOICE_KOORDINATOR), orderController.destroy);
router.post('/:id/send-result', requireRole(ROLES.ADMIN_KOORDINATOR, ROLES.INVOICE_KOORDINATOR, ROLES.TIKET_KOORDINATOR, ROLES.VISA_KOORDINATOR), orderController.sendOrderResult);

module.exports = router;
