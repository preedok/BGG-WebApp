const express = require('express');
const router = express.Router();
const { auth, requireRole } = require('../../middleware/auth');
const { ROLES } = require('../../constants');
const adminCabangController = require('../../controllers/adminCabangController');

router.use(auth);
router.use(requireRole(ROLES.ADMIN_CABANG));

router.get('/dashboard', adminCabangController.getDashboard);
router.get('/orders', adminCabangController.listOrders);
router.post('/users', adminCabangController.createUser);
router.post('/orders/:id/send-result', adminCabangController.sendOrderResult);

module.exports = router;
