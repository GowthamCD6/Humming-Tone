const express = require("express");
const router = express.Router();
const orderController = require('../../controllers/admin/order');
const adminAuth = require('../../middlewares/adminAuth');

router.get('/manage', adminAuth, orderController.getManageOrders);
router.get("/admin/get_order_items/:order_id", adminAuth, orderController.getOrderItems);
router.put('/:orderId/status', adminAuth, orderController.updateOrderStatus);
router.post('/label-data', adminAuth, orderController.getOrderLabelData);
router.put('/bulk-status', adminAuth, orderController.bulkUpdateStatus);
router.get('/export-data', adminAuth, orderController.getExportOrdersData);
router.get('/admin/export_orders_data', adminAuth, orderController.getExportOrdersData);
router.get('/admin/order/export-data', adminAuth, orderController.getExportOrdersData);

module.exports = router;