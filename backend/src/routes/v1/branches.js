const express = require('express');
const router = express.Router();
const branchController = require('../../controllers/branchController');
const { auth, requireRole } = require('../../middleware/auth');
const { ROLES } = require('../../constants');

router.get('/', auth, branchController.list);
router.get('/:id', auth, branchController.getById);
router.post('/', auth, requireRole(ROLES.SUPER_ADMIN, ROLES.ADMIN_PUSAT), branchController.create);
router.patch('/:id', auth, requireRole(ROLES.SUPER_ADMIN, ROLES.ADMIN_PUSAT), branchController.update);

module.exports = router;
