const express = require('express');
const router = express.Router();
const { auth, requireRole } = require('../../middleware/auth');
const { ROLES } = require('../../constants');
const koordinatorController = require('../../controllers/koordinatorController');

router.use(auth);
router.use(requireRole(ROLES.ADMIN_KOORDINATOR));

router.get('/dashboard', koordinatorController.getDashboard);
router.get('/orders', koordinatorController.listOrders);
router.post('/orders/:id/send-result', koordinatorController.sendOrderResult);

module.exports = router;
