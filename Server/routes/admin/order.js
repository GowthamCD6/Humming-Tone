const express = require("express");
const router = express.Router();
const orderController = require('../../controllers/admin/order');

// Endpoint: GET /api/orders/manage
router.get('/manage', orderController.getManageOrders);

module.exports = router;