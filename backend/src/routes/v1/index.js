const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
  res.json({
    message: 'Bintang Global Group API v1',
    version: '1.0.0',
    docs: '/docs/MASTER_BUSINESS_PROCESS.md',
    endpoints: {
      auth: '/api/v1/auth (POST /login, GET /me)',
      owners: '/api/v1/owners (register, upload-mou, list, verify-mou, verify-deposit, assign-branch, activate)',
      branches: '/api/v1/branches',
      orders: '/api/v1/orders',
      invoices: '/api/v1/invoices'
    }
  });
});

router.use('/auth', require('./auth'));
router.use('/owners', require('./owners'));
router.use('/branches', require('./branches'));
router.use('/orders', require('./orders'));
router.use('/invoices', require('./invoices'));

module.exports = router;
