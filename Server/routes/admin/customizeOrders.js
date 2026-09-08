const express = require("express");
const router = express.Router();
const customizeOrder = require("../../controllers/admin/customizeOrder");
const adminAuth = require("../../middlewares/adminAuth");

router.get("/customize-orders", adminAuth, customizeOrder.getCustomizedOrders);
router.get("/customize", adminAuth, customizeOrder.getCustomizedOrders);
router.get("/manage", adminAuth, customizeOrder.getCustomizedOrders);
router.get("/customize-orders/:id", adminAuth, customizeOrder.getCustomizedOrderDetail);
router.put("/customize-orders/:id/status", adminAuth, customizeOrder.updateCustomizedOrderStatus);
router.put("/:id/status", adminAuth, customizeOrder.updateCustomizedOrderStatus);

module.exports = router;
