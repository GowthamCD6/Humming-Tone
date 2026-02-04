const express = require("express");
const router = express.Router();
const orderController = require('../../controllers/admin/order');

router.get('/manage', orderController.getManageOrders);
router.get("/admin/get_order_items/:order_id",orderController.getOrderItems);
router.put('/:orderId/status', orderController.updateOrderStatus);

module.exports = router;