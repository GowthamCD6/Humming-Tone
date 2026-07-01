const express = require("express");
const router = express.Router();
const orderController = require('../../controllers/admin/order');
const adminAuth = require('../../middlewares/adminAuth');

router.get('/manage', adminAuth, orderController.getManageOrders);
router.get("/admin/get_order_items/:order_id", adminAuth, orderController.getOrderItems);
router.put('/:orderId/status', adminAuth, orderController.updateOrderStatus);

module.exports = router;