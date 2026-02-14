const express = require('express');
const router = express.Router();
const invoiceController = require('../../controllers/invoiceController');
const { auth, requireRole } = require('../../middleware/auth');
const { ROLES } = require('../../constants');

router.use(auth);

router.get('/', invoiceController.list);
router.post('/', requireRole(ROLES.OWNER, ROLES.ROLE_INVOICE, ROLES.ADMIN_CABANG, ROLES.ADMIN_PUSAT, ROLES.SUPER_ADMIN), invoiceController.create);
router.get('/:id', invoiceController.getById);

module.exports = router;
