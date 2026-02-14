const express = require('express');
const router = express.Router();
const orderController = require('../../controllers/orderController');
const { auth, requireRole, branchRestriction } = require('../../middleware/auth');
const { ROLES } = require('../../constants');

router.use(auth);

router.get('/', orderController.list);
router.post('/', requireRole(ROLES.OWNER, ROLES.ROLE_INVOICE, ROLES.ADMIN_CABANG, ROLES.ADMIN_PUSAT, ROLES.SUPER_ADMIN), orderController.create);
router.get('/:id', orderController.getById);

module.exports = router;
