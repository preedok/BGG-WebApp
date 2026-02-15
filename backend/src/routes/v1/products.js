const express = require('express');
const router = express.Router();
const { auth, requireRole } = require('../../middleware/auth');
const { ROLES } = require('../../constants');
const productController = require('../../controllers/productController');

router.use(auth);

router.get('/', productController.list);
router.get('/prices', productController.listPrices);
router.get('/:id', productController.getById);
router.get('/:id/price', productController.getPrice);

router.post('/', requireRole(ROLES.SUPER_ADMIN, ROLES.ADMIN_PUSAT), productController.create);
router.patch('/:id', requireRole(ROLES.SUPER_ADMIN, ROLES.ADMIN_PUSAT, ROLES.ADMIN_CABANG), productController.update);

router.post('/prices', requireRole(ROLES.SUPER_ADMIN, ROLES.ADMIN_PUSAT, ROLES.ADMIN_CABANG, ROLES.ROLE_INVOICE), productController.createPrice);
router.patch('/prices/:id', requireRole(ROLES.SUPER_ADMIN, ROLES.ADMIN_PUSAT, ROLES.ADMIN_CABANG, ROLES.ROLE_INVOICE), productController.updatePrice);

module.exports = router;
