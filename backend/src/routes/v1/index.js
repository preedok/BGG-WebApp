const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
  res.json({
    message: 'Bintang Global Group API v1',
    version: '1.0.0',
    endpoints: {
      auth: '/api/v1/auth',
      users: '/api/v1/users',
      hotels: '/api/v1/hotels',
      products: '/api/v1/products',
      orders: '/api/v1/orders'
    }
  });
});

module.exports = router;
