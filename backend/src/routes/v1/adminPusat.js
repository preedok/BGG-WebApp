const express = require('express');
const router = express.Router();
const { auth, requireRole } = require('../../middleware/auth');
const { ROLES } = require('../../constants');
const adminPusatController = require('../../controllers/adminPusatController');

router.use(auth);
router.use(requireRole(ROLES.SUPER_ADMIN, ROLES.ADMIN_PUSAT));

// Dashboard
router.get('/dashboard', adminPusatController.getDashboard);

// User: list, buat & update akun
router.get('/users', adminPusatController.listUsers);
router.post('/users', adminPusatController.createUser);
router.patch('/users/:id', adminPusatController.updateUser);
router.delete('/users/:id', adminPusatController.deleteUser);

// Ketersediaan product (acuan general)
router.put('/products/:id/availability', adminPusatController.setProductAvailability);

module.exports = router;
