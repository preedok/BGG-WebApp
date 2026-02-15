const express = require('express');
const router = express.Router();
const ownerController = require('../../controllers/ownerController');
const { auth, requireRole, branchRestriction } = require('../../middleware/auth');
const { ROLES } = require('../../constants');
const multer = require('multer');
const uploadConfig = require('../../config/uploads');

const mouDir = uploadConfig.getDir(uploadConfig.SUBDIRS.MOU);
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, mouDir),
  filename: (req, file, cb) => {
    const name = uploadConfig.mouFilename(req.user?.id, req.user?.company_name, file.originalname);
    cb(null, name);
  }
});
const upload = multer({ storage, limits: { fileSize: 5 * 1024 * 1024 } });

router.post('/register', ownerController.register);

router.use(auth);

router.get('/me', requireRole(ROLES.OWNER), ownerController.getMyProfile);
router.post('/upload-mou', requireRole(ROLES.OWNER), upload.single('mou_file'), ownerController.uploadMou);

router.get('/', requireRole(ROLES.SUPER_ADMIN, ROLES.ADMIN_PUSAT, ROLES.ADMIN_CABANG), ownerController.list);
router.patch('/:id/verify-mou', requireRole(ROLES.SUPER_ADMIN, ROLES.ADMIN_PUSAT), ownerController.verifyMou);
router.patch('/:id/verify-deposit', requireRole(ROLES.SUPER_ADMIN, ROLES.ADMIN_PUSAT, ROLES.ADMIN_CABANG), ownerController.verifyDeposit);
router.patch('/:id/assign-branch', requireRole(ROLES.SUPER_ADMIN, ROLES.ADMIN_PUSAT, ROLES.ADMIN_CABANG), ownerController.assignBranch);
router.patch('/:id/activate', requireRole(ROLES.SUPER_ADMIN, ROLES.ADMIN_PUSAT, ROLES.ADMIN_CABANG), ownerController.activate);

module.exports = router;
