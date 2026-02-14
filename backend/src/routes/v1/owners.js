const express = require('express');
const router = express.Router();
const ownerController = require('../../controllers/ownerController');
const { auth, requireRole, branchRestriction } = require('../../middleware/auth');
const { ROLES } = require('../../constants');
const multer = require('multer');
const path = require('path');

const upload = multer({
  dest: path.join(__dirname, '../../../uploads/mou'),
  limits: { fileSize: 5 * 1024 * 1024 }
});

router.post('/register', ownerController.register);

router.use(auth);

router.get('/me', requireRole(ROLES.OWNER), ownerController.getMyProfile);
router.post('/upload-mou', requireRole(ROLES.OWNER), upload.single('mou_file'), ownerController.uploadMou);

router.get('/', requireRole(ROLES.SUPER_ADMIN, ROLES.ADMIN_PUSAT), ownerController.list);
router.patch('/:id/verify-mou', requireRole(ROLES.SUPER_ADMIN, ROLES.ADMIN_PUSAT), ownerController.verifyMou);
router.patch('/:id/verify-deposit', requireRole(ROLES.SUPER_ADMIN, ROLES.ADMIN_PUSAT), ownerController.verifyDeposit);
router.patch('/:id/assign-branch', requireRole(ROLES.SUPER_ADMIN, ROLES.ADMIN_PUSAT), ownerController.assignBranch);
router.patch('/:id/activate', requireRole(ROLES.SUPER_ADMIN, ROLES.ADMIN_PUSAT, ROLES.ADMIN_CABANG), ownerController.activate);

module.exports = router;
