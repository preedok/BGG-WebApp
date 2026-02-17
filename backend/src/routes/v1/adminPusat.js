const express = require('express');
const router = express.Router();
const { auth, requireRole } = require('../../middleware/auth');
const { ROLES } = require('../../constants');
const adminPusatController = require('../../controllers/adminPusatController');

router.use(auth);
router.use(requireRole(ROLES.SUPER_ADMIN, ROLES.ADMIN_PUSAT));

// Dashboard & rekap
router.get('/dashboard', adminPusatController.getDashboard);
router.get('/combined-recap', adminPusatController.getCombinedRecap);
router.get('/export-recap-excel', adminPusatController.exportRecapExcel);
router.get('/export-recap-pdf', adminPusatController.exportRecapPdf);

// User: list, buat & update akun
router.get('/users', adminPusatController.listUsers);
router.post('/users', adminPusatController.createUser);
router.patch('/users/:id', adminPusatController.updateUser);
router.delete('/users/:id', adminPusatController.deleteUser);

// Ketersediaan product (acuan general)
router.put('/products/:id/availability', adminPusatController.setProductAvailability);

// Flyer / template design
router.get('/flyers', adminPusatController.listFlyers);
router.get('/flyers/published', adminPusatController.listPublishedFlyers);
router.post('/flyers', adminPusatController.createFlyer);
router.patch('/flyers/:id', adminPusatController.updateFlyer);
router.delete('/flyers/:id', adminPusatController.deleteFlyer);
router.post('/flyers/:id/publish', adminPusatController.publishFlyer);

module.exports = router;
